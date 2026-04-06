import Image from "next/image";
import HeroContent from "@/components/HeroContent";

export default function HomePage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <Image
        src="/images/home-background.webp"
        alt=""
        fill
        className="object-cover object-center"
        priority
      />
      <div className="absolute inset-0 bg-blue-900/60" />
      <HeroContent />
    </main>
  );
}
