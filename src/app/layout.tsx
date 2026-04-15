import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import ZoneColorSync from "@/components/ocean/ZoneColorSync";
import IntroLock from "@/components/IntroLock";
import DiveInButton from "@/components/DiveInButton";
import HudLayer from "@/components/HudLayer";
import DepthScrollProvider from "@/context/DepthScrollContext";
import { ScenePhaseProvider } from "@/context/ScenePhaseContext";
import "./globals.css";

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
});

export const metadata: Metadata = {
  title: "Billy Kaufman",
  description:
    "Full-stack web engineer in NYC. TypeScript, React, Python, Django, AWS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${raleway.variable} h-full antialiased relative`}>
      <body className="min-h-full flex flex-col bg-slate-950 text-white">
        <DepthScrollProvider>
          <ScenePhaseProvider>
            <ZoneColorSync />
            <DiveInButton />
            <HudLayer />
            <IntroLock />
            {children}
          </ScenePhaseProvider>
        </DepthScrollProvider>
      </body>
    </html>
  );
}
