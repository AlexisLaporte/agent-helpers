import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Agent Helpers - Claude Code Customizations",
    template: "%s | Agent Helpers",
  },
  description: "Browse, manage, and sync Claude Code customizations including skills, commands, agents, and output styles.",
  keywords: ["Claude Code", "AI", "customizations", "skills", "commands", "agents", "productivity"],
  authors: [{ name: "Alexis Laporte", url: "https://github.com/AlexisLaporte" }],
  creator: "Alexis Laporte",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://agent-helpers.vercel.app",
    title: "Agent Helpers - Claude Code Customizations",
    description: "Browse, manage, and sync Claude Code customizations including skills, commands, agents, and output styles.",
    siteName: "Agent Helpers",
  },
  twitter: {
    card: "summary_large_image",
    title: "Agent Helpers - Claude Code Customizations",
    description: "Browse, manage, and sync Claude Code customizations including skills, commands, agents, and output styles.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
