import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGameContext } from "@/contexts/GameContext";

import { LivesDisplay } from "./LivesDisplay";
import { RegionProgressBar } from "./RegionProgressBar";

export function ProgressCard() {
  const {
    countries,
    correctGuesses,
    remainingCountries,
    livesRemaining,
    regionProgress,
  } = useGameContext();

  const totalCountries = countries.length;
  const progressPercentage =
    totalCountries > 0 ? (correctGuesses / totalCountries) * 100 : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Your Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats row */}
        <div className="gap-2 grid grid-cols-3 text-center">
          <div className="bg-green-50 dark:bg-green-950 p-2 rounded-lg">
            <p className="font-medium text-muted-foreground text-xs">CORRECT</p>
            <p className="font-bold text-green-600 dark:text-green-400 text-xl">
              {correctGuesses}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded-lg">
            <p className="font-medium text-muted-foreground text-xs">
              REMAINING
            </p>
            <p className="font-bold text-xl">{remainingCountries}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-950 p-2 rounded-lg">
            <p className="font-medium text-muted-foreground text-xs">LIVES</p>
            <div className="flex justify-center pt-1">
              <LivesDisplay livesRemaining={livesRemaining} />
            </div>
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">Progress</span>
            <span className="text-muted-foreground">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full w-full h-3">
            <div
              className="bg-green-500 rounded-full h-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Regional progress */}
        <div className="space-y-2">
          <p className="font-medium text-sm">Regions</p>
          {regionProgress.map((progress) => (
            <RegionProgressBar key={progress.region} progress={progress} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
