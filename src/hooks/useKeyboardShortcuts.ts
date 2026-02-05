import { useEffect } from "react";

import { useGameContext } from "@/contexts/GameContext";
import {
  type CountryCentroids,
  type Direction,
  findCountryInDirection,
} from "@/lib/countryNavigation";

interface UseKeyboardShortcutsOptions {
  onResetView?: () => void;
  onOpenGuessDialog?: () => void;
  isDialogOpen?: boolean;
  // Optional overrides for competitive mode
  gameStatus?: string;
  selectedCountry?: string | null;
  selectCountry?: (code: string) => void;
  countryCentroids?: CountryCentroids;
  unavailableCountries?: Set<string>;
}

export function useKeyboardShortcuts({
  onResetView,
  onOpenGuessDialog,
  isDialogOpen,
  gameStatus: propGameStatus,
  selectedCountry: propSelectedCountry,
  selectCountry: propSelectCountry,
  countryCentroids: propCountryCentroids,
  unavailableCountries: propUnavailableCountries,
}: UseKeyboardShortcutsOptions = {}) {
  const soloContext = useGameContext();

  // Use props if provided, otherwise use solo context
  const gameStatus = propGameStatus ?? soloContext.gameStatus;
  const selectedCountry = propSelectedCountry ?? soloContext.selectedCountry;
  const selectCountry = propSelectCountry ?? soloContext.selectCountry;
  const countryCentroids = propCountryCentroids ?? soloContext.countryCentroids;
  const unavailableCountries =
    propUnavailableCountries ?? soloContext.guessedCountries;

  // Only use solo context methods if not in competitive mode
  const selectRandomCountry =
    propGameStatus === undefined ? soloContext.selectRandomCountry : undefined;
  const resetMapView =
    propGameStatus === undefined ? soloContext.resetMapView : undefined;

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

      // Cmd/Ctrl + R: Select random country (solo mode only)
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key === "r" &&
        selectRandomCountry
      ) {
        event.preventDefault();
        selectRandomCountry();
        return;
      }

      // Escape: Reset map view (only if no dialog is open, solo mode only)
      const isInDialog = (event.target as HTMLElement).closest(
        '[role="dialog"]',
      );
      if (
        event.key === "Escape" &&
        !isDialogOpen &&
        !isInDialog &&
        resetMapView
      ) {
        event.preventDefault();
        resetMapView();
        onResetView?.();
        return;
      }

      // Enter: Open guess dialog (when a country is selected and available)
      if (
        event.key === "Enter" &&
        selectedCountry &&
        !unavailableCountries.has(selectedCountry)
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
      if (direction && selectedCountry && countryCentroids) {
        event.preventDefault();
        const nextCountry = findCountryInDirection(
          selectedCountry,
          direction,
          countryCentroids,
          new Set<string>(), // Allow navigation to all countries (including guessed/claimed)
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
    unavailableCountries,
    isDialogOpen,
  ]);
}
