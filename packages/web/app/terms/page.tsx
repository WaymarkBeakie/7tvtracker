export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 text-neutral-300">
      <h1 className="text-2xl font-semibold text-white">Terms of Service</h1>
      <p className="mt-2 text-sm text-neutral-500">Last updated: 8 August 2026</p>

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
          <h2 className="font-medium text-white">Using the service</h2>
          <p className="mt-2">
            You may only enable the bot for a Twitch channel you own or have been granted
            editor access to. Editors have the same access as the channel owner, including the
            ability to permanently delete a channel&apos;s statistics. Channel owners are
            responsible for who they grant editor access to.
          </p>
        </section>

        <section>
          <h2 className="font-medium text-white">Data loss</h2>
          <p className="mt-2">
            Statistics may be lost through service outages, the reset function, or removal of an
            emote from a channel&apos;s 7TV emote set, which permanently deletes that
            emote&apos;s recorded usage. We do not guarantee that any data can be recovered.
          </p>
        </section>

        <section>
          <h2 className="font-medium text-white">Termination</h2>
          <p className="mt-2">
            You can stop using the service at any time by disabling the bot. We may suspend or
            discontinue the service, in whole or for any channel, at any time and without
            notice.
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
            <p className="text-emerald-400 hover:text-emerald-300">
              roikaryn on Discord
            </p>
          </p>
        </section>
      </div>
    </main>
  );
}