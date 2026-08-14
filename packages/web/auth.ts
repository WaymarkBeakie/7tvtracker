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
      // Resolve 7TV identity and editors in one call (may not exist — that's fine)
      let sevenTvId: string | null = null;
      let editors: { id: string; permissions: number; added_at: number }[] = [];
      let sevenTvOk = false;

      try {
        const res = await fetch(`https://7tv.io/v3/users/twitch/${account.providerAccountId}`);
        if (res.ok) {
          const data = await res.json();
          sevenTvId = data.user?.id ?? null;
          editors = data.user?.editors ?? [];
          sevenTvOk = true;
        }
      } catch (err) {
        console.error("[auth] failed to resolve 7TV data:", err);
      }

      await prisma.user.upsert({
        where: { twitchId: account.providerAccountId },
        update: {
          login,
          displayName: user.name ?? "",
          ...(sevenTvId ? { sevenTvId } : {}),
        },
        create: {
          twitchId: account.providerAccountId,
          sevenTvId,
          login,
          displayName: user.name ?? "",
          channel: {
            create: {
              twitchId: account.providerAccountId,
              login,
            },
          },
        },
      });

      // Sync this user's own channel editors
      if (sevenTvOk) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { twitchId: account.providerAccountId },
            include: { channel: true },
          });

          if (dbUser?.channel) {
            for (const ed of editors) {
              await prisma.channelEditor.upsert({
                where: {
                  channelId_sevenTvUserId: {
                    channelId: dbUser.channel.id,
                    sevenTvUserId: ed.id,
                  },
                },
                update: { permissions: ed.permissions },
                create: {
                  channelId: dbUser.channel.id,
                  sevenTvUserId: ed.id,
                  permissions: ed.permissions,
                  addedAt: new Date(ed.added_at),
                },
              });
            }
            await prisma.channelEditor.deleteMany({
              where: {
                channelId: dbUser.channel.id,
                sevenTvUserId: { notIn: editors.map((e) => e.id) },
              },
            });
          }
        } catch (err) {
          console.error("[auth] own-channel editor sync failed:", err);
        }
      }

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