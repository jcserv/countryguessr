import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGameContext } from "@/contexts/GameContext";

export function ScoreDisplay() {
  const { countries, correctGuesses } = useGameContext();

  const totalCountries = countries.length;
  const progressPercentage =
    totalCountries > 0 ? (correctGuesses / totalCountries) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Progress</CardTitle>
        <CardDescription>Countries identified</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Correct</span>
            <span className="text-2xl font-bold text-green-600">
              {correctGuesses}/{totalCountries}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-green-600 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="pt-2 text-center text-sm text-muted-foreground">
          {correctGuesses === totalCountries && totalCountries > 0
            ? "Perfect! All countries identified!"
            : `${totalCountries - correctGuesses} countries remaining`}
        </div>
      </CardContent>
    </Card>
  );
}
