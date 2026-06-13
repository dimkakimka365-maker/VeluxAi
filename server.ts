import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { streamLocalFallback } from "./localAi";

dotenv.config();

const app = express();
const PORT = 3000;

// Maximum payload size for handling images in base64
app.use(express.json({ limit: "20mb" }));

// Initialize the Gemini client securely
// Always use User-Agent: 'aistudio-build' for telemetry as requested
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "VELOX_AI_FALLBACK_SECURE_KEY",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Server-sent events chat stream endpoint
app.post("/api/chat", async (req, res) => {
  const { messages, systemInstruction, searchGroundingEnabled } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Xabarlar ro'yxati talab etiladi." });
  }

  try {
    // If API Key is missing, empty or matches fallback string, fallback immediately to local AI engine with warning banner
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "VELOX_AI_FALLBACK_SECURE_KEY" || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
      console.warn("GEMINI_API_KEY is not defined. Falling back to Local high-performance AI engine.");
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      
      const systemNotice = `> ⚠️ **TIZIM ESLATMASI (KALIT SOZLANMAGAN)** \n> Bepul va tezkor to'liq aqlli Gemini 3.5-Flash modeliga ulanish uchun: ekranning o'ng tepasidagi **Settings > Secrets** panelida o'z kalitingizni (**GEMINI_API_KEY**) kiriting. \n> *Hozirda sizga VeloxAi Oflayn/Fallback hamrohi orqali javob yozilmoqda:*\n\n---\n\n`;
      res.write(`data: ${JSON.stringify({ text: systemNotice })}\n\n`);

      const userPrompt = messages && messages.length > 0 
        ? messages[messages.length - 1].text || "" 
        : "Salom";
      
      await streamLocalFallback(userPrompt, (chunk) => {
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      });
      res.write("data: [DONE]\n\n");
      return res.end();
    }

    // Format messages into the structure expected by @google/genai:
    // role: "user" | "model"
    // parts: [{ text: string } | { inlineData: { mimeType: string, data: string } }]
    const rawContents = messages.map((msg: any) => {
      const parts: any[] = [];
      
      // If there is an image attachment, include it first
      if (msg.image) {
        // Expected format: data:image/png;base64,iVBORw0KGgo...
        const matches = msg.image.match(/^data:([^;]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          parts.push({
            inlineData: {
              mimeType: matches[1],
              data: matches[2],
            },
          });
        }
      }
      
      // Add text part
      parts.push({ text: msg.text || "" });

      return {
        role: msg.role === "assistant" ? "model" : "user",
        parts,
      };
    });

    // Enforce Alternating Roles (Strict user -> model -> user -> model sequence starts with user)
    const formattedContents: any[] = [];
    rawContents.forEach((msg) => {
      if (formattedContents.length === 0) {
        if (msg.role === "user") {
          formattedContents.push(msg);
        } else {
          // Prepend empty user message if starting with model response
          formattedContents.push({
            role: "user",
            parts: [{ text: "Salom" }]
          });
          formattedContents.push(msg);
        }
      } else {
        const lastMsg = formattedContents[formattedContents.length - 1];
        if (lastMsg.role === msg.role) {
          // Merge parts of sequential duplicate roles
          lastMsg.parts.push(...msg.parts);
        } else {
          formattedContents.push(msg);
        }
      }
    });

    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const responseStream = await ai.models.generateContentStream({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: systemInstruction || "Siz aqlli va yordam beruvchi AI assistentsiz. Foydalanuvchining savollariga to'liq, aniq va chiroyli javob bering.",
        tools: searchGroundingEnabled ? [{ googleSearch: {} }] : [],
      },
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error: any) {
    console.error("Gemini API call failed, activating local fallback:", error);
    
    // Safely write headers if they haven't been sent yet
    if (!res.headersSent) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
    }

    const userPrompt = messages && messages.length > 0 
      ? messages[messages.length - 1].text || "" 
      : "Salom";

    // Robust error signature detection
    const errStatus = error?.status || error?.code || "";
    const errStr = error ? (String(error.message || "") + " " + String(error) + " " + JSON.stringify(error)) : "";
    let systemNotice = "";
    
    if (
      String(errStatus).includes("429") || 
      errStr.includes("RESOURCE_EXHAUSTED") || 
      errStr.includes("429") || 
      errStr.includes("quota") ||
      errStr.includes("RESOURCE_EXHAUSTED") ||
      errStr.toLowerCase().includes("limit")
    ) {
      systemNotice = `> ⚠️ **TIZIM ESLATMASI (KVOTA TUGAGAN)** \n> Bepul va umumiy shaxsiy bo'lmagan Gemini API kaliti kunlik kvotasi to'lgan (RESOURCE_EXHAUSTED 429). \n> To'xtovsiz va tezkor Gemini 3.5-Flash modelida chatni davom ettirish uchun: **Settings > Secrets** panelida o'z shaxsiy **GEMINI_API_KEY** kalitingizni kiriting. \n> *Hozirda sizga VeloxAi kognitiv falsafiy oflayn tizimi orqali ishonchli javob qaytarilmoqda:*\n\n---\n\n`;
    } else if (
      errStr.includes("API_KEY_INVALID") || 
      errStr.includes("INVALID_ARGUMENT") || 
      errStr.includes("400") || 
      errStr.toLowerCase().includes("invalid key") ||
      errStr.toLowerCase().includes("api key")
    ) {
      systemNotice = `> ⚠️ **TIZIM ESLATMASI (KALIT XATOLIGI)** \n> Sozlangan GEMINI_API_KEY kaliti yaroqsiz yoki noto'g'ri (API_KEY_INVALID). \n> Iltimos, **Settings > Secrets** panelida kalit to'g'riligini va unda ortiqcha bo'shliqlar yo'qligini tekshiring. \n> *Hozirda sizga VeloxAi kognitiv falsafiy oflayn tizimi orqali ishonchli javob qaytarilmoqda:*\n\n---\n\n`;
    } else {
      systemNotice = `> ⚠️ **TIZIM ESLATMASI (KUTILMAGAN XATOLIK)** \n> Gemini API ulanishda xatolik yuz berdi: \`${errStr.substring(0, 100)}\` \n> Muammoni bartaraf etuvchi VeloxAi oflayn tizimi ishga tushirildi. \n> *Hozirda sizga VeloxAi kognitiv falsafiy oflayn tizimi orqali ishonchli javob qaytarilmoqda:*\n\n---\n\n`;
    }

    try {
      // First, write the clear warn banner directly to stream for user transparency
      res.write(`data: ${JSON.stringify({ text: systemNotice })}\n\n`);

      // Seamless smart local stream fallback
      await streamLocalFallback(userPrompt, (chunk) => {
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      });
      res.write("data: [DONE]\n\n");
      res.end();
    } catch (fallbackErr) {
      console.log("Local fallback failed:", fallbackErr);
      res.write(`data: ${JSON.stringify({ error: "Suhbat jarayonida kutilmagan xatolik yuz berdi." })}\n\n`);
      res.end();
    }
  }
});

async function startServer() {
  // Vite middleware development mode setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
