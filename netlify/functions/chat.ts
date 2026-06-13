import { GoogleGenAI } from "@google/genai";
import { generateLocalFallback } from "../../localAi";

export default async (req: Request) => {
  // CORS Preflight request handling
  if (req.method === "OPTIONS") {
    return new Response("OK", {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      }
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      }
    });
  }

  // Common headers for CORS and Streaming
  const commonHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const { messages, systemInstruction, searchGroundingEnabled } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Xabarlar ro'yxati talab etiladi." }), {
        status: 400,
        headers: { 
          ...commonHeaders,
          "Content-Type": "application/json" 
        }
      });
    }

    const geminiKey = process.env.GEMINI_API_KEY;

    // Check if the secure Gemini API Key is loaded on Netlify's backend environment
    if (!geminiKey || geminiKey === "VELOX_AI_FALLBACK_SECURE_KEY" || geminiKey === "MY_GEMINI_API_KEY") {
      const systemNotice = `> ⚠️ **TIZIM ESLATMASI (KALIT SOZLANMAGAN - NETLIFY)** \n> Bepul va tezkor to'liq aqlli Gemini 3.5-Flash modeliga ulanish uchun: Netlify boshqaruv panelida (Site settings > Environment variables) o'z shaxsiy **GEMINI_API_KEY** kalitingizni kiriting. \n> *Hozirda sizga VeloxAi Oflayn/Fallback hamrohi orqali javob yozilmoqda:*\n\n---\n\n`;
      
      const userPrompt = messages && messages.length > 0 
        ? messages[messages.length - 1].text || "" 
        : "Salom";

      const fallbackText = systemNotice + generateLocalFallback(userPrompt);

      // Stream fallback back using standard Server-Sent Events headers
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: fallbackText })}\n\n`));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        }
      });

      return new Response(stream, {
        headers: {
          ...commonHeaders,
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive"
        }
      });
    }

    // Initialize the Gemini client securely in Netlify runtime
    const ai = new GoogleGenAI({
      apiKey: geminiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const rawContents = messages.map((msg: any) => {
      const parts: any[] = [];
      if (msg.image) {
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
      parts.push({ text: msg.text || "" });
      return {
        role: msg.role === "assistant" ? "model" : "user",
        parts,
      };
    });

    const formattedContents: any[] = [];
    rawContents.forEach((msg) => {
      if (formattedContents.length === 0) {
        if (msg.role === "user") {
          formattedContents.push(msg);
        } else {
          formattedContents.push({
            role: "user",
            parts: [{ text: "Salom" }]
          });
          formattedContents.push(msg);
        }
      } else {
        const lastMsg = formattedContents[formattedContents.length - 1];
        if (lastMsg.role === msg.role) {
          lastMsg.parts.push(...msg.parts);
        } else {
          formattedContents.push(msg);
        }
      }
    });

    const responseStream = await ai.models.generateContentStream({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: systemInstruction || "Siz aqlli va yordam beruvchi AI assistentsiz. Foydalanuvchining savollariga to'liq, aniq va chiroyli javob bering.",
        tools: searchGroundingEnabled ? [{ googleSearch: {} }] : [],
      },
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of responseStream) {
            if (chunk.text) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk.text })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (err: any) {
          console.error("Error in Netlify streaming response:", err);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: err.message || "Suhbat jarayonida kutilmagan xatolik yuz berdi." })}\n\n`));
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        ...commonHeaders,
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    });

  } catch (error: any) {
    console.error("Netlify internal error handler:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), {
      status: 500,
      headers: { 
        ...commonHeaders,
        "Content-Type": "application/json" 
      }
    });
  }
};
