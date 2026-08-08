import { prisma } from "@emotetracker/db";

const CLIENT_ID = process.env.TWITCH_CLIENT_ID!;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET!;

export const REFRESH_BUFFER_MS = 5 * 60_000; //5 mins

export async function getValidBotToken(): Promise<string> {
  const cred = await prisma.botCredential.findUnique({ where: { id: "bot" } });
  if (!cred) {
    throw new Error(
      "No bot credentials found. Run `pnpm get-bot-token` in packages/bot first."
    );
  }

  const expiresInMs = cred.expiresAt.getTime() - Date.now();


  if (expiresInMs > REFRESH_BUFFER_MS) {
    return cred.accessToken;
  }

  console.log("[auth] bot token expiring soon, refreshing...");

  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: cred.refreshToken,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token refresh failed: ${text}`);
  }

  const data = await res.json();
  const expiresAt = new Date(Date.now() + data.expires_in * 1000);

  await prisma.botCredential.update({
    where: { id: "bot" },
    data: {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt,
    },
  });

  console.log("[auth] bot token refreshed successfully");
  return data.access_token;
}