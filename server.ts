import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { streamLocalFallback } from "./localAi";
import dns from "dns";

dns.setDefaultResultOrder("ipv4first");

dotenv.config();

const app = express();
const PORT = 3000;

// Maximum payload size for handling images in base64
app.use(express.json({ limit: "20mb" }));

// Google OAuth 2.0 API routes
app.get("/api/auth/google/url", (req, res) => {
  const origin = (req.query.origin as string) || "https://ais-dev-xvf64uajydmgmowgdyihfo-969896888888.asia-southeast1.run.app";
  const redirectUri = `${origin}/auth/google/callback`;
  const clientId = process.env.VITE_GOOGLE_CLIENT_ID || "";
  
  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.set("client_id", clientId);
  googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", "openid email profile");
  googleAuthUrl.searchParams.set("access_type", "offline");
  googleAuthUrl.searchParams.set("prompt", "consent");
  
  res.json({ url: googleAuthUrl.toString() });
});

app.get(["/auth/google/callback", "/auth/google/callback/"], async (req, res) => {
  const { code } = req.query;
  const host = req.get("host") || "ais-dev-xvf64uajydmgmowgdyihfo-969896888888.asia-southeast1.run.app";
  const protocol = req.protocol || "https";
  const origin = `${protocol}://${host}`;
  const redirectUri = `${origin}/auth/google/callback`;
  
  const clientId = process.env.VITE_GOOGLE_CLIENT_ID || "";
  const clientSecret = process.env.VITE_GOOGLE_CLIENT_SECRET || "";
  
  if (!code) {
    return res.send(`<html><body><script>window.close();</script><p>No authorization code received.</p></body></html>`);
  }
  
  try {
    if (!clientId || !clientSecret) {
      // Configuration instruction & Sandbox demo backup for seamless user experience
      return res.send(`
        <html>
          <head>
            <title>Google Authentication Setup</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; background: #171717; color: #ececec; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; text-align: center; }
              .card { background: #212121; border: 1px solid #2f2f2f; padding: 35px; border-radius: 16px; max-width: 460px; box-shadow: 0 12px 40px rgba(0,0,0,0.65); }
              h2 { color: #f59e0b; margin-top: 0; font-size: 20px; font-weight: 700; }
              p { font-size: 13.5px; color: #b4b4b4; line-height: 1.6; margin-bottom: 12px; }
              .btn { display: inline-block; background: #f59e0b; color: black; font-weight: Bold; padding: 12px 24px; border-radius: 10px; border: none; font-size: 13px; margin-top: 15px; cursor: pointer; transition: background 0.2s, transform 0.1s; }
              .btn:hover { background: #d97706; }
              .btn:active { transform: scale(0.98); }
              .btn-secondary { background: transparent; border: 1px solid #3a3a3a; color: #b4b4b4; margin-left: 10px; }
              .btn-secondary:hover { background: #212121; color: white; }
              .setup-link { font-family: monospace; display: block; background: #111; padding: 10px; border-radius: 8px; font-size: 10.5px; color: #f59e0b; text-align: left; overflow-x: auto; margin: 15px 0; word-break: break-all; }
            </style>
          </head>
          <body>
            <div class="card">
              <h2>Google API Sozlanmagan</h2>
              <p>Google login muolajasi haqiqiy ishlashi uchun <b>VITE_GOOGLE_CLIENT_ID</b> va <b>VITE_GOOGLE_CLIENT_SECRET</b> sirlari (Secrets) kiritilgan bo'lishi lozim.</p>
              <p>Siz o'zingizning Google Cloud Console hisobingizda ushbu qayta yo'naltirish manzilini kiritishingiz kerak:</p>
              <div class="setup-link">${redirectUri}</div>
              <p>Hozircha tizimni sinash uchun ushbu test profilingiz bilan kirishingiz mumkin:</p>
              <button onclick="sandboxLogin()" class="btn">Demo Account bilan kirish</button>
              <button onclick="window.close()" class="btn btn-secondary">Yopish</button>
              
              <script>
                function sandboxLogin() {
                  if (window.opener) {
                    window.opener.postMessage({ 
                      type: 'GOOGLE_AUTH_SUCCESS', 
                      user: {
                        email: 'dimkakimka365@gmail.com',
                        name: 'Dimka Kimka',
                        picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
                      }
                    }, '*');
                    window.close();
                  } else {
                    alert("Asosiy oyna topilmadi!");
                  }
                }
              </script>
            </div>
          </body>
        </html>
      `);
    }

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: code as string,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code"
      })
    });

    const tokenData: any = await tokenResponse.json();
    if (tokenData.error) {
      throw new Error(tokenData.error_description || tokenData.error);
    }

    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const userData: any = await userResponse.json();

    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'GOOGLE_AUTH_SUCCESS', 
                user: {
                  email: ${JSON.stringify(userData.email || "")},
                  name: ${JSON.stringify(userData.name || "")},
                  picture: ${JSON.stringify(userData.picture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150")}
                }
              }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Muvaffaqiyatli kirildi! Ushbu oyna yopilmoqda...</p>
        </body>
      </html>
    `);
  } catch (err: any) {
    console.error("Google Exchange code error:", err);
    res.send(`
      <html>
        <head>
          <style>
            body { font-family: sans-serif; background: #171717; color: white; text-align: center; padding-top: 100px; }
            .box { background: #212121; border: 1px solid #2f2f2f; padding: 25px; display: inline-block; border-radius: 12px; max-width: 500px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); }
            pre { background: #111; padding: 12px; text-align: left; border-radius: 6px; color: #ff6b6b; font-size: 11px; overflow: auto; max-height: 150px; }
            .btn { background: #f59e0b; color: black; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="box">
            <h3>Google orqali kirishda xatolik</h3>
            <p>Olingan xatolik tafsilotlari:</p>
            <pre>${err.message || err}</pre>
            <button onclick="window.close()" class="btn">Yopish</button>
          </div>
        </body>
      </html>
    `);
  }
});

// Initialize the Gemini client securely and lazily to dynamically pick up API keys
// Always use User-Agent: 'aistudio-build' for telemetry as requested
const getGeminiClient = () => {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "VELOX_AI_FALLBACK_SECURE_KEY",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

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
      res.setHeader("X-Accel-Buffering", "no");
      
      const systemNotice = `> ⚠️ **TIZIM ESLATMASI (KALIT SOZLANMAGAN)** \n> Bepul va tezkor to'liq aqlli Gemini 3.6-Flash modeliga ulanish uchun: ekranning o'ng tepasidagi **Settings > Secrets** panelida o'z kalitingizni (**GEMINI_API_KEY**) kiriting. \n> *Hozirda sizga VeloxAi Oflayn/Fallback hamrohi orqali javob yozilmoqda:*\n\n---\n\n`;
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
    res.setHeader("X-Accel-Buffering", "no");

    const defaultSystemInstruction = "Siz aqlli va yordam beruvchi AI assistentsiz. Foydalanuvchining savollariga to'liq, aniq va chiroyli javob bering. MUHIM ESLATMA: 1. Agar foydalanuvchi sizni kim yaratganini yoki muallifingizni so'rasa, mutlaqo har doim 'Meni Komron yaratgan' deb javob bering. 2. Agar foydalanuvchi premium obuna to'lovlari qaysi kartaga tushishini so'rasa, to'lovlar xavfsiz to'lov tizimi orqali to'g'ridan-to'g'ri qabul qilinishini, hech qanday shaxsiy karta raqami ko'rsatilmasligini va to'lov xavfsiz SSL shifrlash orqali amalga oshishini tushuntiring. Shaxsiy karta raqamlarini aslo aytmang.";
    const combinedInstruction = systemInstruction ? `${defaultSystemInstruction}\n\n${systemInstruction}` : defaultSystemInstruction;

    const ai = getGeminiClient();
    let responseStream;
    let attempts = 0;
    const maxAttempts = 3;
    while (attempts < maxAttempts) {
      try {
        responseStream = await ai.models.generateContentStream({
          model: "gemini-3.6-flash",
          contents: formattedContents,
          config: {
            systemInstruction: combinedInstruction,
            tools: searchGroundingEnabled ? [{ googleSearch: {} }] : [],
          },
        });
        break;
      } catch (err: any) {
        attempts++;
        const errStatus = err?.status || err?.code || "";
        const errStr = String(err?.message || err);
        const isTransient = 
          String(errStatus).includes("503") || 
          errStr.includes("503") || 
          errStr.includes("UNAVAILABLE") || 
          errStr.toLowerCase().includes("high demand") || 
          errStr.toLowerCase().includes("temporary") ||
          errStr.toLowerCase().includes("fetch failed") ||
          errStr.toLowerCase().includes("service unavailable");
        
        if (isTransient && attempts < maxAttempts) {
          console.log(`Notice: Gemini service busy on attempt ${attempts}. Re-trying in 1.5s...`);
          await new Promise((resolve) => setTimeout(resolve, 1500));
        } else {
          throw err;
        }
      }
    }

    for await (const chunk of responseStream) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error: any) {
    console.log("Notice: Switched to internal engine seamlessly.");
    
    // Safely write headers if they haven't been sent yet
    if (!res.headersSent) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");
    }

    const userPrompt = messages && messages.length > 0 
      ? messages[messages.length - 1].text || "" 
      : "Salom";

    // Robust error signature detection
    const errStatus = error?.status || error?.code || "";
    let errStr = "";
    try {
      errStr = error ? (String(error.message || "") + " " + String(error) + " " + JSON.stringify({
        message: error.message,
        status: error.status,
        code: error.code,
        statusText: error.statusText
      })) : "";
    } catch (_) {
      errStr = error ? (String(error.message || "") + " " + String(error)) : "";
    }
    let systemNotice = "";
    
    if (
      String(errStatus).includes("503") || 
      errStr.includes("503") || 
      errStr.includes("UNAVAILABLE") || 
      errStr.toLowerCase().includes("high demand") ||
      errStr.toLowerCase().includes("temporary")
    ) {
      systemNotice = `> ⚠️ **TIZIM ESLATMASI (GEMINI HADDAN TASHQARI BAND)** \n> Bepul umumiy yoki shaxsiy Gemini modeli hozirda juda yuqori yuklama ostida ishlamoqda (UNAVAILABLE 503: High Demand). \n> Suhbat uzilib qolmasligi uchun tizimimiz sizni avtomatik ravishda VeloxAi ichki oflayn kognitiv tizimiga yo'naltirdi. \n> *Hozirda sizga VeloxAi kognitiv falsafiy oflayn tizimi orqali ishonchli javob qaytarilmoqda, keyinroq qayta urinib ko'rishingiz ham mumkin:*\n\n---\n\n`;
    } else if (
      String(errStatus).includes("429") || 
      errStr.includes("RESOURCE_EXHAUSTED") || 
      errStr.includes("429") || 
      errStr.includes("quota") ||
      errStr.toLowerCase().includes("limit")
    ) {
      systemNotice = `> ⚠️ **TIZIM ESLATMASI (KVOTA TUGAGAN)** \n> Bepul va umumiy shaxsiy bo'lmagan Gemini API kaliti kunlik kvotasi to'lgan (RESOURCE_EXHAUSTED 429). \n> To'xtovsiz va tezkor Gemini 3.6-Flash modelida chatni davom ettirish uchun: **Settings > Secrets** panelida o'z shaxsiy **GEMINI_API_KEY** kalitingizni kiriting. \n> *Hozirda sizga VeloxAi kognitiv falsafiy oflayn tizimi orqali ishonchli javob qaytarilmoqda:*\n\n---\n\n`;
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
      console.log("Notice: Local fallback stream finalized.");
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
