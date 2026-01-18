import { useMemo, useState } from "react";

import { ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useGameContext } from "@/contexts/GameContext";
import { calculateRegionProgress } from "@/lib/regionMapping";
import { cn, getCountryFlagEmoji } from "@/lib/utils";
import type { CompletedGame } from "@/types/game";
import { GAME_CONFIG } from "@/types/game";

interface GameHistoryCardProps {
  game: CompletedGame;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const day = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return `${time}, ${day}`;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatTotalTime(): string {
  return formatDuration(GAME_CONFIG.INITIAL_TIME_SECONDS);
}

export function GameHistoryCard({ game }: GameHistoryCardProps) {
  const { countries } = useGameContext();
  const [expanded, setExpanded] = useState(false);
  const [showWrongGuesses, setShowWrongGuesses] = useState(false);
  const [showUnguessedCountries, setShowUnguessedCountries] = useState(false);

  const hasDetailedData =
    game.guessedCountryCodes.length > 0 || game.wrongGuesses.length > 0;

  const guessedSet = useMemo(
    () => new Set(game.guessedCountryCodes),
    [game.guessedCountryCodes],
  );

  const regionProgress = useMemo(() => {
    if (!hasDetailedData || countries.length === 0) return [];
    return calculateRegionProgress(countries, guessedSet);
  }, [countries, guessedSet, hasDetailedData]);

  const unguessedCountries = useMemo(() => {
    if (!hasDetailedData || countries.length === 0) return [];
    return countries.filter((c) => !guessedSet.has(c.properties.ISO_A2));
  }, [countries, guessedSet, hasDetailedData]);

  const guessedCountriesList = useMemo(() => {
    if (!hasDetailedData || countries.length === 0) return [];
    return countries.filter((c) => guessedSet.has(c.properties.ISO_A2));
  }, [countries, guessedSet, hasDetailedData]);

  const getCountryName = (code: string): string => {
    const country = countries.find((c) => c.properties.ISO_A2 === code);
    return country?.properties.NAME || code;
  };

  return (
    <Card
      className={cn(
        "transition-all",
        game.result === "won"
          ? "border-l-4 border-l-green-500"
          : "border-l-4 border-l-red-500",
      )}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-wrap">
            <span
              className={cn(
                "font-semibold",
                game.result === "won" ? "text-green-600" : "text-red-600",
              )}
            >
              {game.result === "won" ? "Victory" : "Defeat"}
            </span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {formatDate(game.completedAt)}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpanded(!expanded)}
            className="shrink-0"
          >
            {expanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="flex items-center gap-4 mt-2 text-sm flex-wrap">
          <div className="flex items-center gap-1">
            <span className="text-zinc-500 dark:text-zinc-400">Time:</span>
            <span className="font-mono">
              {formatDuration(game.timeElapsed)} / {formatTotalTime()}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-zinc-500 dark:text-zinc-400">Guessed:</span>
            <span className="font-mono">
              {game.correctGuesses}/{game.totalCountries}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-zinc-500 dark:text-zinc-400">Lives:</span>
            <span className="font-mono">
              {game.livesRemaining}/{GAME_CONFIG.INITIAL_LIVES}
            </span>
            <span className="text-red-500">
              {"❤️".repeat(game.livesRemaining)}
              {"🖤".repeat(GAME_CONFIG.INITIAL_LIVES - game.livesRemaining)}
            </span>
          </div>
        </div>
      </CardHeader>

      {/* Expanded Content */}
      {expanded && (
        <CardContent className="p-4 pt-2 border-t">
          {!hasDetailedData ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 italic">
              Detailed data not available for this game.
            </p>
          ) : (
            <div className="space-y-4">
              {/* Region Progress */}
              <div>
                <h4 className="font-semibold mb-2 text-sm">Region Progress</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {regionProgress.map((region) => (
                    <div
                      key={region.region}
                      className="flex items-center gap-2"
                    >
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span>{region.region}</span>
                          <span>
                            {region.guessed}/{region.total}
                          </span>
                        </div>
                        <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              region.percentage === 100
                                ? "bg-green-500"
                                : "bg-blue-500",
                            )}
                            style={{ width: `${region.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Wrong Guesses */}
              {game.wrongGuesses.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-sm">
                      Wrong Guesses ({game.wrongGuesses.length})
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowWrongGuesses(!showWrongGuesses)}
                      className="h-6 px-2 text-xs"
                    >
                      {showWrongGuesses ? (
                        <>
                          <EyeOff className="h-3 w-3 mr-1" /> Hide
                        </>
                      ) : (
                        <>
                          <Eye className="h-3 w-3 mr-1" /> Show
                        </>
                      )}
                    </Button>
                  </div>
                  {showWrongGuesses && (
                    <div className="space-y-1 text-sm">
                      {game.wrongGuesses.map((wrong, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300"
                        >
                          <span className="text-red-500">✗</span>
                          <span>
                            Guessed{" "}
                            <span className="font-medium">
                              {getCountryFlagEmoji(wrong.guessedCode)}{" "}
                              {getCountryName(wrong.guessedCode)}
                            </span>
                          </span>
                          <span className="text-zinc-400">→</span>
                          <span>
                            was{" "}
                            <span className="font-medium">
                              {getCountryFlagEmoji(wrong.actualCode)}{" "}
                              {getCountryName(wrong.actualCode)}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Countries Lists */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-sm">Countries</h4>
                  {unguessedCountries.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setShowUnguessedCountries(!showUnguessedCountries)
                      }
                      className="h-6 px-2 text-xs"
                    >
                      {showUnguessedCountries ? (
                        <>
                          <EyeOff className="h-3 w-3 mr-1" /> Hide unguessed
                        </>
                      ) : (
                        <>
                          <Eye className="h-3 w-3 mr-1" /> Reveal unguessed
                        </>
                      )}
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 text-xs">
                  {guessedCountriesList.map((country) => (
                    <span
                      key={country.properties.ISO_A2}
                      className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded"
                    >
                      {getCountryFlagEmoji(country.properties.ISO_A2)}{" "}
                      {country.properties.NAME}
                    </span>
                  ))}
                  {showUnguessedCountries &&
                    unguessedCountries.map((country) => (
                      <span
                        key={country.properties.ISO_A2}
                        className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded"
                      >
                        {getCountryFlagEmoji(country.properties.ISO_A2)}{" "}
                        {country.properties.NAME}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
