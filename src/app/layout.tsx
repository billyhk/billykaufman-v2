import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import NavBar from "@/components/NavBar";
import "./globals.css";

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
});

export const metadata: Metadata = {
  title: "Billy Kaufman — SWE",
  description:
    "Full-stack web engineer in NYC. TypeScript, React, Python, Django, AWS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${raleway.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-950 text-white">
        <NavBar />
        {children}
      </body>
    </html>
  );
}
