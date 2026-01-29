import { Globe, Heart, Timer } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGameContext } from "@/contexts/GameContext";

export function StartScreen() {
  const { startGame, countries } = useGameContext();

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="mx-4 max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Globe className="h-6 w-6" />
            CountryGuessr
          </CardTitle>
          <CardDescription>Test your world geography knowledge</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            Click on countries on the map and type their names to identify them.
            Can you name all {countries.length} countries before time runs out?
          </p>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 rounded-lg bg-muted p-2">
              <Timer className="h-4 w-4 text-blue-500" />
              <span>30 minute timer</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-muted p-2">
              <Heart className="h-4 w-4 text-red-500" />
              <span>3 lives</span>
            </div>
          </div>

          <div className="space-y-2 rounded-lg bg-muted p-3 text-sm">
            <p className="font-medium">How to play:</p>
            <ol className="list-inside list-decimal space-y-1 text-muted-foreground">
              <li>Click any country on the map to select it</li>
              <li>Type the country&apos;s name in the search box</li>
              <li>Select the correct answer from the suggestions</li>
              <li>Wrong answers cost you a life!</li>
            </ol>
          </div>

          <Button onClick={startGame} className="w-full" size="lg">
            START QUIZ
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
