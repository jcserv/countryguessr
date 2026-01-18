import type { RegionProgress } from "@/types/game";

interface RegionProgressBarProps {
  progress: RegionProgress;
}

const REGION_COLORS: Record<string, string> = {
  Europe: "bg-blue-500",
  Americas: "bg-green-500",
  Africa: "bg-yellow-500",
  "Middle East & Central Asia": "bg-orange-500",
  "Asia & Oceania": "bg-purple-500",
};

const REGION_EMOJIS: Record<string, string> = {
  Europe: "🦊",
  Americas: "🦅",
  Africa: "🦁",
  "Middle East & Central Asia": "🐪",
  "Asia & Oceania": "🐼",
};

export function RegionProgressBar({ progress }: RegionProgressBarProps) {
  const colorClass = REGION_COLORS[progress.region] || "bg-gray-500";
  const emoji = REGION_EMOJIS[progress.region] || "";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-muted-foreground">
          {emoji} {progress.region}
        </span>
        <span className="text-muted-foreground">
          {progress.guessed}/{progress.total}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className={`h-full rounded-full transition-all duration-300 ${colorClass}`}
          style={{ width: `${progress.percentage}%` }}
        />
      </div>
    </div>
  );
}
