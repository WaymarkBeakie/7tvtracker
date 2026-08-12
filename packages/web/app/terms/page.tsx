export const metadata = {
  title: "Terms of Service",
  description: "Terms of service for 7TV Emote Tracker.",
};

export default function TermsPage() {
  return (
    <main className="min-h-0 flex-1 overflow-y-auto px-6 py-12 text-neutral-300">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold text-white">Terms of Service</h1>
        <p className="mt-2 text-sm text-neutral-500">Last updated: 12 August 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="font-medium text-white">The service</h2>
            <p className="mt-2">
              7TV Emote Tracker is a free tool that reports how often 7TV emotes are used in a
              Twitch channel&apos;s chat. It is provided as-is, with no guarantee of availability,
              accuracy, or continued operation.
            </p>
          </section>

          <section>
            <h2 className="font-medium text-white">Not affiliated</h2>
            <p className="mt-2">
              This service is an independent project. It is not affiliated with, endorsed by, or
              sponsored by Twitch Interactive, Inc. or 7TV. All trademarks belong to their
              respective owners.
            </p>
          </section>

          <section>
            <h2 className="font-medium text-white">Accounts and access</h2>
            <p className="mt-2">
              You may only enable the bot for a Twitch channel you own. If you are listed as an
              editor of a channel on 7TV, you can view that channel&apos;s statistics, but you
              cannot change its settings, enable or disable the bot, or delete its data — those
              actions are limited to the channel owner.
            </p>
            <p className="mt-2">
              Editor access is derived from 7TV&apos;s public data and updates when we next
              synchronise with it. Removing someone as a 7TV editor may not revoke their access
              here immediately.
            </p>
          </section>

          <section>
            <h2 className="font-medium text-white">Data loss</h2>
            <p className="mt-2">
              Statistics may be lost through service outages, the reset and delete functions, the
              90-day retention limit on daily records, or removal of an emote from a
              channel&apos;s 7TV emote set, which permanently deletes that emote&apos;s recorded
              usage. There are no backups, and we do not guarantee that any data can be recovered.
            </p>
          </section>

          <section>
            <h2 className="font-medium text-white">Acceptable use</h2>
            <p className="mt-2">
              Do not attempt to access channels you do not own or edit, interfere with the
              service&apos;s operation, or use it in a way that would breach Twitch&apos;s or
              7TV&apos;s terms.
            </p>
          </section>

          <section>
            <h2 className="font-medium text-white">Termination</h2>
            <p className="mt-2">
              You can stop using the service at any time by disabling the bot or deleting your
              account. We may suspend or discontinue the service, in whole or for any channel, at
              any time and without notice.
            </p>
          </section>

          <section>
            <h2 className="font-medium text-white">Liability</h2>
            <p className="mt-2">
              The service is provided without warranty of any kind. We are not liable for any
              damages arising from your use of, or inability to use, the service.
            </p>
          </section>

          <section>
            <h2 className="font-medium text-white">Contact</h2>
            <p className="mt-2">
              
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