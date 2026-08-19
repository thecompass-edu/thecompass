import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const essays = localFont({
  src: [
    {
      path: "../fonts/Essays1743.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/Essays1743-Bold.woff",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/Essays1743-Italic.woff",
      weight: "400",
      style: "italic",
    },
    {
      path: "../fonts/Essays1743-BoldItalic.woff",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-essays",
  display: "swap",
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
      className={`${essays.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}