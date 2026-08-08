import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "./navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "7TV Emote Tracker",
  description: "Track 7TV emote usage in your Twitch chat",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://cdn.7tv.app" />
        <link rel="dns-prefetch" href="https://cdn.7tv.app" />
      </head>
      <body className="bg-neutral-950">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
