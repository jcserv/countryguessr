import { useEffect, useState } from "react";

import { createLazyFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";

import { GameHistoryCard } from "@/components/GameHistoryCard";
import { StatsOverview } from "@/components/StatsOverview";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useGameContext } from "@/contexts/GameContext";
import { clearGameHistory, loadGameHistory } from "@/lib/storage";
import type { CompletedGame } from "@/types/game";

export const Route = createLazyFileRoute("/stats")({
  component: Stats,
});

function Stats() {
  const { countries } = useGameContext();
  const [games, setGames] = useState<CompletedGame[]>([]);

  useEffect(() => {
    const history = loadGameHistory();
    // Sort by completedAt descending (most recent first)
    const sortedGames = [...history.games].sort(
      (a, b) => b.completedAt - a.completedAt,
    );
    setGames(sortedGames);
  }, []);

  const handleClearHistory = () => {
    clearGameHistory();
    setGames([]);
  };

  return (
    <section className="mx-auto p-4 max-w-4xl">
      <StatsOverview games={games} countries={countries} />

      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-2xl">Game History</h2>
        {games.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Trash2 className="mr-2 w-4 h-4" />
                Clear History
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear Game History?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all {games.length} game
                  {games.length === 1 ? "" : "s"} from your history. This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearHistory}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Clear History
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {games.length === 0 ? (
        <div className="py-12 text-zinc-500 dark:text-zinc-400 text-center">
          <p className="text-lg">No games played yet.</p>
          <p className="mt-2 text-sm">
            Complete a game to see your history here!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {games.map((game, index) => (
            <GameHistoryCard key={`${game.completedAt}-${index}`} game={game} />
          ))}
        </div>
      )}
    </section>
  );
}
