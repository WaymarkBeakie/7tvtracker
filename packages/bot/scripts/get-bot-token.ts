import "dotenv/config";
import http from "node:http";
import { prisma } from "@emotetracker/db";

const CLIENT_ID = process.env.TWITCH_CLIENT_ID!;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET!;
const REDIRECT_URI = "http://localhost:3333/callback";
const SCOPES = ["chat:read", "chat:edit"].join(" ");

const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
  REDIRECT_URI
)}&response_type=code&scope=${encodeURIComponent(SCOPES)}`;

console.log("\nLog in as your BOT account, then open this URL:\n");
console.log(authUrl);
console.log("\nWaiting for authorization...\n");

const server = http.createServer(async (req, res) => {
  if (!req.url?.startsWith("/callback")) {
    res.writeHead(404);
    res.end();
    return;
  }

  const url = new URL(req.url, "http://localhost:3333");
  const code = url.searchParams.get("code");

  if (!code) {
    res.writeHead(400);
    res.end("Missing code");
    return;
  }

  const tokenRes = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: REDIRECT_URI,
    }),
  });

  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    res.writeHead(500);
    res.end("Token exchange failed");
    console.error("Token exchange failed:", text);
    server.close();
    process.exit(1);
  }

  const data = await tokenRes.json();
  const expiresAt = new Date(Date.now() + data.expires_in * 1000);

  await prisma.botCredential.upsert({
    where: { id: "bot" },
    update: {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt,
    },
    create: {
      id: "bot",
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt,
    },
  });

  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Success! You can close this tab and return to the terminal.");
  console.log("Bot credentials saved to database.");
  server.close();
  process.exit(0);
});

server.listen(3333);