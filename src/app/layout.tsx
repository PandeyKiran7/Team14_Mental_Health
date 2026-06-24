import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import DevConsoleApi from "@/components/DevConsoleApi";
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
  title: "Diabetes Management System | Team 14",
  description:
    "Track blood glucose, manage medications, book appointments, and access diabetes health resources - CT071-3-3-DDAC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
    >
      <body className="flex min-h-screen flex-col">
        {process.env.NODE_ENV === "development" ? <DevConsoleApi /> : null}
        {children}
      </body>
    </html>
  );
}
