import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import NavBar from "@/components/NavBar";
import ScrollProgress from "@/components/ScrollProgress";
import DepthGauge from "@/components/ocean/DepthGauge";
import HudSensorPanel from "@/components/ocean/HudSensorPanel";
import HudBottomBar from "@/components/ocean/HudBottomBar";
import ZoneColorSync from "@/components/ocean/ZoneColorSync";
import HudBrackets from "@/components/HudBrackets";
import IntroLock from "@/components/IntroLock";
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
    <html lang="en" className={`${raleway.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-950 text-white">
        <ScrollProgress />
        <NavBar />
        <ZoneColorSync />
        <DepthGauge />
        <HudSensorPanel />
        <HudBottomBar />
        <HudBrackets />
        <IntroLock />
{children}
      </body>
    </html>
  );
}
