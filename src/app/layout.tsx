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
    default: "The Compass | Financial Literacy for Young People",
    template: "%s | The Compass",
  },
  description:
    "The Compass is a youth organization making financial literacy accessible through education, real-world tools, and community.",
  keywords: [
    "financial literacy",
    "financial education",
    "money management",
    "personal finance",
    "youth financial education",
    "financial education Indonesia",
  ],
  authors: [{ name: "The Compass" }],
  creator: "The Compass",
  publisher: "The Compass",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
