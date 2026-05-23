import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = "https://ghostty-config-editor.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Ghostty Config Editor — A visual editor for your Ghostty terminal",
  description:
    "An open-source macOS app that gives Ghostty's ~580 config keys a real UI: live preview, theme gallery, color picker, keybind editor, and timestamped backups.",
  applicationName: "Ghostty Config Editor",
  keywords: [
    "Ghostty",
    "terminal",
    "config",
    "editor",
    "macOS",
    "Tauri",
    "themes",
  ],
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Ghostty Config Editor",
    description:
      "A visual editor for your Ghostty terminal config — live preview, themes, keybinds, and backups.",
    images: [{ url: "/icon-512.png", width: 512, height: 512 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ghostty Config Editor",
    description:
      "A visual editor for your Ghostty terminal config — live preview, themes, keybinds, and backups.",
    images: ["/icon-512.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-256.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
