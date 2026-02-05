import { useState } from "react";

import { Check, Loader2 } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useCompetitive } from "@/contexts/CompetitiveContext";
import { filterCountries } from "@/lib/countryData";
import { cn } from "@/lib/utils";
import type { CountryFeature } from "@/types/country";

interface CompetitiveGuessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCountry: string | null;
  countries: CountryFeature[];
}

export function CompetitiveGuessDialog({
  open,
  onOpenChange,
  selectedCountry,
  countries,
}: CompetitiveGuessDialogProps) {
  const { gameState, submitGuess, isEliminated } = useCompetitive();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get claimed countries as a Set
  const claimedCountries = gameState
    ? new Set(gameState.claimedCountries.keys())
    : new Set<string>();

  // Filter countries based on search query, excluding already claimed ones
  const filteredCountries = searchQuery.trim()
    ? filterCountries(searchQuery, countries).filter(
        (country) => !claimedCountries.has(country.properties.ISO_A2),
      )
    : [];

  const handleSelect = async (countryCode: string) => {
    if (!selectedCountry || gameState?.status !== "playing" || isEliminated) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await submitGuess(selectedCountry, countryCode);
      if (response.correct) {
        setSearchQuery("");
        onOpenChange(false);
      } else if (response.is_eliminated) {
        setError(
          "Wrong guess! You've lost all your lives and been eliminated.",
        );
        setTimeout(() => {
          setSearchQuery("");
          onOpenChange(false);
        }, 2000);
      } else if (response.lives !== undefined) {
        setError(
          `Wrong guess! You lost a life. ${response.lives} ${response.lives === 1 ? "life" : "lives"} remaining.`,
        );
      } else {
        setError(response.error || "Failed to submit guess");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit guess");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSearchQuery("");
      setError(null);
    }
    onOpenChange(newOpen);
  };

  const isDisabled =
    gameState?.status !== "playing" ||
    !selectedCountry ||
    isSubmitting ||
    isEliminated;

  const placeholder = isEliminated
    ? "You've been eliminated!"
    : gameState?.status !== "playing"
      ? "Waiting for game to start..."
      : selectedCountry
        ? "Type the name of the highlighted country..."
        : "Click a country on the map first!";

  return (
    <CommandDialog
      open={open}
      onOpenChange={handleOpenChange}
      shouldFilter={false}
    >
      <CommandInput
        placeholder={placeholder}
        value={searchQuery}
        onValueChange={setSearchQuery}
        disabled={isDisabled}
      />
      {error && <div className="px-4 py-2 text-sm text-red-500">{error}</div>}
      <CommandList>
        {searchQuery.trim() && <CommandEmpty>No countries found.</CommandEmpty>}
        {filteredCountries.length > 0 && (
          <CommandGroup heading="">
            {filteredCountries.slice(0, 10).map((country) => {
              const code = country.properties.ISO_A2;
              const name = country.properties.NAME;
              const isClaimed = claimedCountries.has(code);

              return (
                <CommandItem
                  key={code}
                  value={name}
                  onSelect={() => handleSelect(code)}
                  disabled={isClaimed || isDisabled}
                  className="cursor-pointer"
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  ) : (
                    <Check
                      className={cn(
                        "mr-2 w-4 h-4",
                        isClaimed ? "opacity-100" : "opacity-0",
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      isClaimed && "line-through text-muted-foreground",
                    )}
                  >
                    {name}
                  </span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
