import { useMemo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, getCountryFlagEmoji } from "@/lib/utils";
import type { CountryFeature } from "@/types/country";
import type { CompletedGame } from "@/types/game";

interface StatsOverviewProps {
  games: CompletedGame[];
  countries: CountryFeature[];
}

function getGreenHue(rate: number): string {
  if (rate >= 0.8) return "bg-green-500 dark:bg-green-600 text-white";
  if (rate >= 0.6) return "bg-green-400 dark:bg-green-500 text-white";
  if (rate >= 0.4) return "bg-green-300 dark:bg-green-400 text-green-900";
  if (rate >= 0.2) return "bg-green-200 dark:bg-green-300 text-green-800";
  return "bg-green-100 dark:bg-green-200 text-green-700";
}

export function StatsOverview({ games, countries }: StatsOverviewProps) {
  const wins = useMemo(
    () => games.filter((g) => g.result === "won").length,
    [games],
  );

  const losses = useMemo(
    () => games.filter((g) => g.result === "lost").length,
    [games],
  );

  const highScore = useMemo(
    () =>
      games.length > 0 ? Math.max(...games.map((g) => g.correctGuesses)) : 0,
    [games],
  );

  const bestTime = useMemo(() => {
    const wonGames = games.filter((g) => g.result === "won");
    if (wonGames.length === 0) return null;
    return Math.min(...wonGames.map((g) => g.timeElapsed));
  }, [games]);

  const countryRates = useMemo(() => {
    if (games.length === 0) return [];

    // Calculate guess counts per country
    const guessCountByCountry = new Map<string, number>();
    for (const game of games) {
      for (const code of game.guessedCountryCodes) {
        guessCountByCountry.set(code, (guessCountByCountry.get(code) || 0) + 1);
      }
    }

    // Convert to array with rates, sorted by rate descending
    return Array.from(guessCountByCountry.entries())
      .map(([code, count]) => ({
        code,
        count,
        rate: count / games.length,
      }))
      .sort((a, b) => b.rate - a.rate);
  }, [games]);

  const getCountryName = (code: string): string => {
    const country = countries.find((c) => c.properties.ISO_A2 === code);
    return country?.properties.NAME || code;
  };

  return (
    <div className="space-y-4 mb-6">
      <h2 className="font-bold text-2xl">Stats Overview</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Wins
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <span className="text-3xl font-bold text-green-600 dark:text-green-400">
              {wins}
            </span>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Losses
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <span className="text-3xl font-bold text-red-600 dark:text-red-400">
              {losses}
            </span>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              High Score
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <span className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {highScore}
            </span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400 ml-1">
              / 178
            </span>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Best Time
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {bestTime !== null ? (
              <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {Math.floor(bestTime / 60)}:
                {String(bestTime % 60).padStart(2, "0")}
              </span>
            ) : (
              <span className="text-xl text-zinc-400 dark:text-zinc-500">
                No wins yet
              </span>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Country Guess Rates Card */}
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Country Guess Rates
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          {countryRates.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 italic">
              No countries guessed yet.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1 text-xs">
              {countryRates.map(({ code, rate }) => (
                <span
                  key={code}
                  className={cn("px-2 py-0.5 rounded", getGreenHue(rate))}
                >
                  {getCountryFlagEmoji(code)} {getCountryName(code)}{" "}
                  {Math.round(rate * 100)}%
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
