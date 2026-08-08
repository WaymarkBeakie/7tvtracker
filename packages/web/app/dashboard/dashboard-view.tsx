import { prisma } from "@emotetracker/db";
import { BotToggle } from "./bot-toggle";
import { EmoteGrid } from "./emote-grid";
import type { ChannelAccess } from "@/lib/channel-access";

export async function DashboardView({
  access,
  channelLogin,
}: {
  access: ChannelAccess;
  channelLogin?: string;
}) {
  const channelId = access.channel.id;

  const channelEmotes = await prisma.emote.findMany({ where: { channelId } });
  const totals = await prisma.channelEmoteTotal.findMany({ where: { channelId } });
  const countByEmoteId = new Map(totals.map((t) => [t.emoteId, t.count]));

  const emotes = channelEmotes.map((e) => ({
    id: e.id,
    name: e.name,
    sevenTvId: e.sevenTvId,
    count: countByEmoteId.get(e.id) ?? 0,
  }));

  return (
    <main className="bg-neutral-950 text-white px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">
            #{access.channel.login}
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            {access.isOwner ? "Your channel" : "You have editor access to this channel"}
          </p>
        </header>

        <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
          {/* existing bot toggle section */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-medium">Emote Tracking Bot</h2>
              <p className="mt-1 text-sm text-neutral-400">
                {access.channel.botEnabled
                  ? "The bot is currently active in this chat."
                  : "The bot is not currently joined to this chat."}
              </p>
            </div>
            <BotToggle enabled={access.channel.botEnabled} channelLogin={channelLogin} />
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-medium">Emotes</h2>
          {emotes.length === 0 ? (
            <p className="text-sm text-neutral-500">No emotes found for this channel.</p>
          ) : (
            <EmoteGrid emotes={emotes} channelLogin={channelLogin} />
          )}
        </section>
      </div>
    </main>
  );
}