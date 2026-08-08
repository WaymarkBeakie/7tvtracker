import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-neutral-900 px-6 py-6">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 text-xs text-neutral-600 sm:flex-row">
        <p>
          Not affiliated with Twitch or 7TV.
        </p>
        <div className="flex items-center gap-4">
          <Link href="/terms" className="hover:text-neutral-400">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-neutral-400">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}