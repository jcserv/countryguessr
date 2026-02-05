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
import { filterCountries } from "@/lib/countryData";
import { cn } from "@/lib/utils";
import type { CountryFeature } from "@/types/country";
import type {
  GuessResult,
  UnifiedGameMode,
  UnifiedGameStatus,
} from "@/types/unified-game";

interface UnifiedGuessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: UnifiedGameMode;
  status: UnifiedGameStatus;
  selectedCountry: string | null;
  countries: CountryFeature[];
  isCountryAvailable: (code: string) => boolean;
  submitGuess: (code: string) => Promise<GuessResult>;
  isEliminated?: boolean;
}

export function UnifiedGuessDialog({
  open,
  onOpenChange,
  mode,
  status,
  selectedCountry,
  countries,
  isCountryAvailable,
  submitGuess,
  isEliminated = false,
}: UnifiedGuessDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter countries based on search query, excluding unavailable ones
  const filteredCountries = searchQuery.trim()
    ? filterCountries(searchQuery, countries).filter((country) =>
        isCountryAvailable(country.properties.ISO_A2),
      )
    : [];

  const handleSelect = async (countryCode: string) => {
    if (!selectedCountry || status !== "playing") {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await submitGuess(countryCode);
      if (result.success) {
        setSearchQuery("");
        onOpenChange(false);
      } else if (result.isEliminated) {
        setError(result.error || "You've been eliminated!");
        setTimeout(() => {
          setSearchQuery("");
          onOpenChange(false);
        }, 2000);
      } else {
        setError(result.error || "Incorrect guess");
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
    status !== "playing" || !selectedCountry || isSubmitting || isEliminated;

  const placeholder = isEliminated
    ? "You've been eliminated!"
    : status !== "playing"
      ? mode === "competitive"
        ? "Waiting for game to start..."
        : "Start a game to begin guessing!"
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
              const isAvailable = isCountryAvailable(code);

              return (
                <CommandItem
                  key={code}
                  value={name}
                  onSelect={() => handleSelect(code)}
                  disabled={!isAvailable || isDisabled}
                  className="cursor-pointer"
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  ) : (
                    <Check
                      className={cn(
                        "mr-2 w-4 h-4",
                        !isAvailable ? "opacity-100" : "opacity-0",
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      !isAvailable && "line-through text-muted-foreground",
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
