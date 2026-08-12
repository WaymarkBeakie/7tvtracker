import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "./navbar";
import { Footer } from "./footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://7tvtracker.com"),
  title: {
    default: "7TV Emote Tracker — See which emotes your Twitch chat actually uses",
    template: "%s | 7TV Emote Tracker",
  },
  description:
    "Free analytics for 7TV emotes in Twitch chat. Track usage counts, spot emotes nobody uses, and see when your community uses them most.",
  keywords: ["7tv", "twitch", "emote analytics", "emote tracker", "twitch chat stats"],
  openGraph: {
    type: "website",
    url: "https://7tvtracker.com",
    siteName: "7TV Emote Tracker",
    title: "7TV Emote Tracker",
    description:
      "See which 7TV emotes your Twitch chat actually uses, and how often.",
  },
  twitter: {
    card: "summary_large_image",
    title: "7TV Emote Tracker",
    description:
      "See which 7TV emotes your Twitch chat actually uses, and how often.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://cdn.7tv.app" />
        <link rel="dns-prefetch" href="https://cdn.7tv.app" />
      </head>
    <body className="flex h-screen flex-col overflow-hidden bg-neutral-950">
      <Navbar />
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      <Footer />
    </body>
    </html>
  );
};