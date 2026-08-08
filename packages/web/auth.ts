import NextAuth from "next-auth";
import TwitchProvider from "next-auth/providers/twitch";
import { prisma } from "@emotetracker/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    TwitchProvider({
      clientId: process.env.TWITCH_CLIENT_ID!,
      clientSecret: process.env.TWITCH_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account) return false;

      const login = ((profile as any)?.login ?? user.name ?? "").toLowerCase();

      // Resolve their 7TV identity (may not exist — that's fine)
      let sevenTvId: string | null = null;
      try {
        const res = await fetch(`https://7tv.io/v3/users/twitch/${account.providerAccountId}`);
        if (res.ok) {
          const data = await res.json();
          sevenTvId = data.user?.id ?? null;
        }
      } catch (err) {
        console.error("[auth] failed to resolve 7TV id:", err);
      }

      await prisma.user.upsert({
        where: { twitchId: account.providerAccountId },
        update: {
          login,
          displayName: user.name ?? "",
          accessToken: account.access_token ?? "",
          refreshToken: account.refresh_token ?? "",
          ...(sevenTvId ? { sevenTvId } : {}),
        },
        create: {
          twitchId: account.providerAccountId,
          sevenTvId,
          login,
          displayName: user.name ?? "",
          accessToken: account.access_token ?? "",
          refreshToken: account.refresh_token ?? "",
          channel: {
            create: {
              twitchId: account.providerAccountId,
              login,
            },
          },
        },
      });

      return true;
    },
    async jwt({ token, account }) {
      if (account) {
        token.twitchId = account.providerAccountId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.twitchId) {
        (session as any).twitchId = token.twitchId as string;
      }
      return session;
    },
  },
});