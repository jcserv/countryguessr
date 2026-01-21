import { useState } from "react";

import { Check } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useGameContext } from "@/contexts/GameContext";
import { filterCountries } from "@/lib/countryData";
import { cn } from "@/lib/utils";

interface GuessCommandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GuessCommandDialog({
  open,
  onOpenChange,
}: GuessCommandDialogProps) {
  const {
    countries,
    guessedCountries,
    selectedCountry,
    submitGuess,
    gameStatus,
  } = useGameContext();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter countries based on search query, excluding already guessed ones
  // Only show results when user starts typing
  const filteredCountries = searchQuery.trim()
    ? filterCountries(searchQuery, countries).filter(
        (country) => !guessedCountries.has(country.properties.ISO_A2),
      )
    : [];

  const handleSelect = (countryCode: string) => {
    if (!selectedCountry || gameStatus !== "playing") {
      return;
    }

    submitGuess(countryCode);
    setSearchQuery("");
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSearchQuery("");
    }
    onOpenChange(newOpen);
  };

  const isDisabled = gameStatus !== "playing" || !selectedCountry;

  const placeholder =
    gameStatus !== "playing"
      ? "Start a game to begin guessing!"
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
      <CommandList>
        {searchQuery.trim() && <CommandEmpty>No countries found.</CommandEmpty>}
        {filteredCountries.length > 0 && (
          <CommandGroup heading="">
            {filteredCountries.slice(0, 10).map((country) => {
              const code = country.properties.ISO_A2;
              const name = country.properties.NAME;
              const isGuessed = guessedCountries.has(code);

              return (
                <CommandItem
                  key={code}
                  value={name}
                  onSelect={() => handleSelect(code)}
                  disabled={isGuessed || isDisabled}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 w-4 h-4",
                      isGuessed ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span
                    className={cn(
                      isGuessed && "line-through text-muted-foreground",
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
