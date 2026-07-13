export default async (req: Request) => {
  const urlObj = new URL(req.url);
  const code = urlObj.searchParams.get("code");
  
  // Dynamically resolve protocol and host
  const host = req.headers.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const origin = `${protocol}://${host}`;
  const redirectUri = `${origin}/auth/google/callback`;

  const clientId = process.env.VITE_GOOGLE_CLIENT_ID || "";
  const clientSecret = process.env.VITE_GOOGLE_CLIENT_SECRET || "";

  if (!code) {
    return new Response(
      `<html><body><script>window.close();</script><p>No authorization code received.</p></body></html>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  // Fallback sandbox info card if secrets are missing
  if (!clientId || !clientSecret) {
    return new Response(`
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
            <p>Google login muolajasi haqiqiy ishlashi uchun <b>VITE_GOOGLE_CLIENT_ID</b> va <b>VITE_GOOGLE_CLIENT_SECRET</b> sirlari (Secrets) kiritilgan bo'llishi lozim.</p>
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
    `, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: code,
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

    return new Response(`
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
    `, { headers: { "Content-Type": "text/html; charset=utf-8" } });

  } catch (err: any) {
    console.error("Google Exchange code error on Netlify:", err);
    return new Response(`
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
    `, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
};
