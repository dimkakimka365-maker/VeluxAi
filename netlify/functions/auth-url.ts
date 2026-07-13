export default async (req: Request) => {
  // CORS Preflight request handling
  if (req.method === "OPTIONS") {
    return new Response("OK", {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      }
    });
  }

  const urlObj = new URL(req.url);
  const origin = urlObj.searchParams.get("origin") || "https://ais-dev-xvf64uajydmgmowgdyihfo-969896888888.asia-southeast1.run.app";
  const redirectUri = `${origin}/auth/google/callback`;
  const clientId = process.env.VITE_GOOGLE_CLIENT_ID || "";

  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.set("client_id", clientId);
  googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", "openid email profile");
  googleAuthUrl.searchParams.set("access_type", "offline");
  googleAuthUrl.searchParams.set("prompt", "consent");

  return new Response(JSON.stringify({ url: googleAuthUrl.toString() }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
};
