import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex h-full flex-col items-center justify-center px-6 py-20 text-center text-white">      <h1 className="text-3xl font-semibold tracking-tight">7TV Emote Tracker</h1>
      <p className="mt-3 max-w-md text-neutral-400">
        See which 7TV emotes your chat actually uses, and how often. Sign in with Twitch to get
        started.
      </p>
      <form
        action={async () => {
          "use server";
          await signIn("twitch", { redirectTo: "/dashboard" });
        }}
      >
        <button
          type="submit"
          className="mt-6 rounded-lg bg-emerald-500/10 px-5 py-2.5 text-sm font-medium text-emerald-400 hover:bg-emerald-500/20"
        >
          Sign in with Twitch
        </button>
      </form>
    </main>
  );
}