import { GoogleGenAI } from "@google/genai";
import { generateLocalFallback, streamLocalFallback } from "../../localAi";
import dns from "dns";

dns.setDefaultResultOrder("ipv4first");

function handleFallbackResponse(error: any, messages: any[], commonHeaders: any) {
  const userPrompt = messages && messages.length > 0 
    ? messages[messages.length - 1].text || "" 
    : "Salom";

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

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: systemNotice })}\n\n`));
        await streamLocalFallback(userPrompt, (chunk) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`));
        });
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (fallbackErr) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Suhbat jarayonida kutilmagan xatolik yuz berdi." })}\n\n`));
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
}

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
      const systemNotice = `> ⚠️ **TIZIM ESLATMASI (KALIT SOZLANMAGAN - NETLIFY)** \n> Bepul va tezkor to'liq aqlli Gemini 3.6-Flash modeliga ulanish uchun: Netlify boshqaruv panelida (Site settings > Environment variables) o'z shaxsiy **GEMINI_API_KEY** kalitingizni kiriting. \n> *Hozirda sizga VeloxAi Oflayn/Fallback hamrohi orqali javob yozilmoqda:*\n\n---\n\n`;
      
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

    const defaultSystemInstruction = "Siz aqlli va yordam beruvchi AI assistentsiz. Foydalanuvchining savollariga to'liq, aniq va chiroyli javob bering. MUHIM ESLATMA: 1. Agar foydalanuvchi sizni kim yaratganini yoki muallifingizni so'rasa, mutlaqo har doim 'Meni Komron yaratgan' deb javob bering. 2. Agar foydalanuvchi premium obuna to'lovlari qaysi kartaga tushishini so'rasa, to'lovlar xavfsiz to'lov tizimi orqali to'g'ridan-to'g'ri qabul qilinishini, hech qanday shaxsiy karta raqami ko'rsatilmasligini va to'lov xavfsiz SSL shifrlash orqali amalga oshishini tushuntiring. Shaxsiy karta raqamlarini aslo aytmang.";
    const combinedInstruction = systemInstruction ? `${defaultSystemInstruction}\n\n${systemInstruction}` : defaultSystemInstruction;

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
          console.log(`Notice: Gemini service busy on attempt ${attempts} on Netlify. Re-trying in 1.5s...`);
          await new Promise((resolve) => setTimeout(resolve, 1500));
        } else if (attempts >= maxAttempts) {
          console.log("Notice: Switched to internal engine seamlessly on Netlify after retries.");
          return handleFallbackResponse(err, messages, commonHeaders);
        } else {
          console.log("Notice: Switched to internal engine seamlessly on Netlify.");
          return handleFallbackResponse(err, messages, commonHeaders);
        }
      }
    }

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
          console.error("Error in Netlify streaming response, falling back:", err);
          try {
            const errStatus = err?.status || err?.code || "";
            let errStr = "";
            try {
              errStr = err ? (String(err.message || "") + " " + String(err) + " " + JSON.stringify({
                message: err.message,
                status: err.status,
                code: err.code,
                statusText: err.statusText
              })) : "";
            } catch (_) {
              errStr = err ? (String(err.message || "") + " " + String(err)) : "";
            }
            let systemNotice = "";
            if (String(errStatus).includes("503") || errStr.includes("503") || errStr.includes("UNAVAILABLE") || errStr.toLowerCase().includes("high demand") || errStr.toLowerCase().includes("temporary")) {
              systemNotice = `\n\n> ⚠️ **TIZIM ESLATMASI (GEMINI HADDAN TASHQARI BAND)** \n> Bepul umumiy yoki shaxsiy Gemini modeli hozirda juda yuqori yuklama ostida ishlamoqda. \n> *Hozirda sizga VeloxAi kognitiv oflayn tizimi orqali ishonchli javob qaytarilmoqda:*\n\n---\n\n`;
            } else {
              systemNotice = `\n\n> ⚠️ **TIZIM ESLATMASI (STRIM XATOLIGI)** \n> Gemini API uzatishda xatolik yuz berdi. \n> *Hozirda sizga VeloxAi kognitiv oflayn tizimi orqali ishonchli javob qaytarilmoqda:*\n\n---\n\n`;
            }
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: systemNotice })}\n\n`));
            const userPrompt = messages && messages.length > 0 ? messages[messages.length - 1].text || "" : "Salom";
            await streamLocalFallback(userPrompt, (chunk) => {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`));
            });
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          } catch (fallbackErr) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Suhbat jarayonida kutilmagan xatolik yuz berdi." })}\n\n`));
          }
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
