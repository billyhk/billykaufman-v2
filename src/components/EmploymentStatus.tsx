import { IS_OPEN_TO_WORK } from "@/data/bio";
import { experienceData } from "@/data/experience";

export default function EmploymentStatus() {
  if (IS_OPEN_TO_WORK) {
    return (
      <span className="flex items-center gap-2 text-sm text-white/60">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
        </span>
        Open to new opportunities
      </span>
    );
  }
  return (
    <span className="text-sm text-white/60">
      {experienceData[0].title} at {experienceData[0].institutionName}
    </span>
  );
}
