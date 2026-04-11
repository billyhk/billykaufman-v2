import FishEat from "@/components/FishEat";
import SeaFloorHop from "@/components/SeaFloorHop";

export default function GamesSection() {
  return (
    <>
      <div className="hidden md:block border-t border-white/10 pt-8 pb-2">
        <p className="text-white/30 text-xs text-center tracking-widest uppercase mb-6">Eat or be eaten</p>
        <FishEat />
      </div>
      <div className="block md:hidden -mx-6 mt-8">
        <p className="text-white/30 text-xs text-center tracking-widest uppercase mb-4 px-6">Hop or be squished</p>
        <SeaFloorHop />
      </div>
    </>
  );
}
