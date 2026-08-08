import Link from "next/link";
import { auth, signOut } from "@/auth";
import { prisma } from "@emotetracker/db";
import { ChannelDropdown } from "./channel-dropdown";

export async function Navbar() {
  const session = await auth();
  const twitchId = (session as any)?.twitchId;

  let editableChannels: { id: string; login: string }[] = [];

  if (twitchId) {
    const user = await prisma.user.findUnique({ where: { twitchId } });
    if (user?.sevenTvId) {
      const rows = await prisma.channelEditor.findMany({
        where: { sevenTvUserId: user.sevenTvId },
        include: { channel: true },
      });
      editableChannels = rows.map((r) => ({ id: r.id, login: r.channel.login }));
    }
  }

  return (
    <nav className="border-b border-neutral-800 bg-neutral-950 px-6 py-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight text-white">
          7TV Emote Tracker
        </Link>

        {session?.user ? (
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-neutral-300 hover:text-white">
              Dashboard
            </Link>

            {editableChannels.length > 0 && (
              <ChannelDropdown channels={editableChannels} />
            )}

            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="rounded-lg border border-neutral-800 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-900"
              >
                Sign out
              </button>
            </form>
          </div>
        ) : (
          <Link
            href="/api/auth/signin"
            className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-400 hover:bg-emerald-500/20"
          >
            Sign in with Twitch
          </Link>
        )}
      </div>
    </nav>
  );
}