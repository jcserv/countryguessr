import { useEffect } from "react";

import { useGameContext } from "@/contexts/GameContext";
import {
  type Direction,
  findCountryInDirection,
} from "@/lib/countryNavigation";

interface UseKeyboardShortcutsOptions {
  onResetView?: () => void;
  onOpenGuessDialog?: () => void;
  isDialogOpen?: boolean;
}

export function useKeyboardShortcuts({
  onResetView,
  onOpenGuessDialog,
  isDialogOpen,
}: UseKeyboardShortcutsOptions = {}) {
  const {
    selectRandomCountry,
    resetMapView,
    gameStatus,
    selectedCountry,
    selectCountry,
    countryCentroids,
    guessedCountries,
  } = useGameContext();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when game is playing
      if (gameStatus !== "playing") return;

      // Check if user is typing in an input
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        // Only allow Escape in inputs
        if (event.key !== "Escape") return;
      }

      // Cmd/Ctrl + R: Select random country
      if ((event.metaKey || event.ctrlKey) && event.key === "r") {
        event.preventDefault();
        selectRandomCountry();
        return;
      }

      // Escape: Reset map view (only if no dialog is open)
      // Check both the state and if the target is inside a dialog element
      const isInDialog = (event.target as HTMLElement).closest(
        '[role="dialog"]',
      );
      if (event.key === "Escape" && !isDialogOpen && !isInDialog) {
        event.preventDefault();
        resetMapView();
        onResetView?.();
        return;
      }

      // Enter: Open guess dialog (when a country is selected and not already guessed)
      if (
        event.key === "Enter" &&
        selectedCountry &&
        !guessedCountries.has(selectedCountry)
      ) {
        event.preventDefault();
        onOpenGuessDialog?.();
        return;
      }

      // Arrow keys: Navigate between countries
      const arrowKeyMap: Record<string, Direction> = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
      };

      const direction = arrowKeyMap[event.key];
      if (direction && selectedCountry) {
        event.preventDefault();
        const nextCountry = findCountryInDirection(
          selectedCountry,
          direction,
          countryCentroids,
          new Set<string>(), // Allow navigation to all countries (including guessed)
        );
        if (nextCountry) {
          selectCountry(nextCountry);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectRandomCountry,
    resetMapView,
    gameStatus,
    onResetView,
    selectedCountry,
    onOpenGuessDialog,
    selectCountry,
    countryCentroids,
    guessedCountries,
    isDialogOpen,
  ]);
}
