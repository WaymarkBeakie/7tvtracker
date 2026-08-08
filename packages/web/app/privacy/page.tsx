export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 text-neutral-300">
      <h1 className="text-2xl font-semibold text-white">Privacy Policy</h1>
      <p className="mt-2 text-sm text-neutral-500">Last updated: 8 August 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="font-medium text-white">What this service does</h2>
          <p className="mt-2">
            7TV Emote Tracker counts how often 7TV emotes are used in a Twitch channel&apos;s
            chat, so streamers can see which emotes their community actually uses. A streamer
            must explicitly enable the bot for their own channel before any data is collected.
          </p>
        </section>

        <section>
          <h2 className="font-medium text-white">What we collect from chat</h2>
          <p className="mt-2">
            When the bot is active in a channel, it reads public chat messages and records only
            that an emote was used, which emote it was, and when. We do not store message
            content, usernames, user IDs, or any other information that identifies individual
            chatters. Emote usage data is aggregated and cannot be traced back to any person.
          </p>
        </section>

        <section>
          <h2 className="font-medium text-white">What we collect from account holders</h2>
          <p className="mt-2">
            If you sign in with Twitch, we store your Twitch user ID, username, display name,
            and OAuth tokens issued by Twitch. If your Twitch account is linked to a 7TV
            account, we also store your 7TV user ID in order to determine which channels you
            have editor access to.
          </p>
        </section>

        <section>
          <h2 className="font-medium text-white">How long we keep it</h2>
          <p className="mt-2">
            Daily emote usage records are automatically deleted after 90 days. Running totals
            per emote are kept for as long as the channel uses the service. Account information
            is kept until you ask us to delete it.
          </p>
        </section>

        <section>
          <h2 className="font-medium text-white">Sharing</h2>
          <p className="mt-2">
            We do not sell or share collected data with third parties. Emote statistics for a
            channel are visible only to the channel owner and their 7TV editors.
          </p>
        </section>

        <section>
          <h2 className="font-medium text-white">Your choices</h2>
          <p className="mt-2">
            A streamer can disable the bot at any time from their dashboard, which stops all
            collection for that channel immediately, and can permanently delete all collected
            statistics for their channel using the reset function. To request deletion of your
            account information, contact us at the address below.
          </p>
        </section>

        <section>
          <h2 className="font-medium text-white">Contact</h2>
          <p className="mt-2">
            Questions or requests:{" "}
            <p className="text-emerald-400 hover:text-emerald-300">
              roikaryn on Discord
            </p>
          </p>
        </section>
      </div>
    </main>
  );
}