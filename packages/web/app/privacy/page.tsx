export const metadata = {
  title: "Privacy Policy",
  description: "What data 7TV Emote Tracker collects and how long it's kept.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-0 flex-1 overflow-y-auto px-6 py-12 text-neutral-300">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold text-white">Privacy Policy</h1>
        <p className="mt-2 text-sm text-neutral-500">Last updated: 12 August 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="font-medium text-white">What this service does</h2>
            <p className="mt-2">
              7TV Emote Tracker counts how often 7TV emotes are used in a Twitch channel&apos;s
              chat, so streamers can see which emotes their community actually uses. A streamer
              must sign in and explicitly enable the bot for their own channel before any data is
              collected, and can disable it at any time.
            </p>
          </section>

          <section>
            <h2 className="font-medium text-white">What we collect from chat</h2>
            <p className="mt-2">
              When the bot is active in a channel, it reads public chat messages and records only
              which emote was used and when. We do not store message content, usernames, user IDs,
              or anything else that identifies individual chatters. Emote counts are aggregated
              and cannot be traced back to any person, including by us.
            </p>
          </section>

          <section>
            <h2 className="font-medium text-white">What we collect from account holders</h2>
            <p className="mt-2">
              If you sign in with Twitch, we store your Twitch user ID, username, display name,
              and the OAuth tokens Twitch issues to us. If your Twitch account is linked to a 7TV
              account, we also store your 7TV user ID so we can determine which channels you have
              editor access to.
            </p>
            <p className="mt-2">
              For channels using the service, we store the 7TV user IDs of that channel&apos;s
              editors, taken from 7TV&apos;s public API. We also record periodic timestamps
              confirming the bot is connected, which power the uptime display.
            </p>
          </section>

          <section>
            <h2 className="font-medium text-white">How long we keep it</h2>
            <p className="mt-2">
              Daily emote counts are deleted automatically after 90 days. Connection timestamps
              are deleted after 30 days. All-time totals per emote are kept for as long as the
              channel uses the service. Account information is kept until you delete your account
              or ask us to remove it.
            </p>
          </section>

          <section>
            <h2 className="font-medium text-white">Sharing</h2>
            <p className="mt-2">
              We do not sell or share collected data with third parties. A channel&apos;s emote
              statistics are visible only to the channel owner and their 7TV editors.
            </p>
          </section>

          <section>
            <h2 className="font-medium text-white">Your choices</h2>
            <p className="mt-2">
              Channel owners can disable the bot at any time, which stops all collection for that
              channel immediately. From the settings page you can export your channel&apos;s data
              as a CSV file, permanently delete all collected statistics, or delete your account
              entirely — which removes your channel, all associated data, and your account
              information, and signs you out. These actions cannot be undone.
            </p>
          </section>

          <section>
            <h2 className="font-medium text-white">Contact</h2>
            <p className="mt-2">
              Questions or requests:{" "}
              
              <a href="mailto:contact@7tvtracker.com"
                className="text-emerald-400 hover:text-emerald-300"
              >
                contact@7tvtracker.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}