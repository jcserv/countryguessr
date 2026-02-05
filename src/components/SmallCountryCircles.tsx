import { useCallback, useEffect, useRef, useState } from "react";
import { Marker } from "react-leaflet";

import L from "leaflet";

import { useCompetitive } from "@/contexts/CompetitiveContext";
import { useGameContext } from "@/contexts/GameContext";
import { SMALL_COUNTRY_CIRCLES } from "@/lib/countryNavigation";

interface SmallCountryCirclesProps {
  onCountryDoubleClick?: () => void;
  // For competitive mode
  competitiveMode?: boolean;
  selectedCountry?: string | null;
  onSelectCountry?: (code: string) => void;
}

// Create a DivIcon styled as a circle
function createCircleIcon(
  color: string,
  fillColor: string,
  fillOpacity: number,
  dashed: boolean,
): L.DivIcon {
  const size = 24;
  const borderStyle = dashed ? "dashed" : "solid";
  const background =
    fillOpacity > 0
      ? `${fillColor}${Math.round(fillOpacity * 255)
          .toString(16)
          .padStart(2, "0")}`
      : "transparent";

  return L.divIcon({
    className: "", // Clear default leaflet styles
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2], // Center the icon on the point
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: 2px ${borderStyle} ${color};
      background: ${background};
      box-sizing: border-box;
      cursor: pointer;
    "></div>`,
  });
}

const LONG_PRESS_THRESHOLD = 500; // ms
const MOVE_TOLERANCE = 10; // px

export function SmallCountryCircles({
  onCountryDoubleClick,
  competitiveMode = false,
  selectedCountry: propSelectedCountry,
  onSelectCountry,
}: SmallCountryCirclesProps) {
  // Use solo mode context
  const soloContext = useGameContext();

  // Conditionally use competitive context (only when in competitive mode)
  // We call the hook unconditionally at the module level to follow rules of hooks
  // but only use its result when in competitive mode
  let competitiveContext: ReturnType<typeof useCompetitive> | null = null;
  try {
    // This try-catch is needed because the component can be used outside CompetitiveProvider

    competitiveContext = competitiveMode ? useCompetitive() : null;
  } catch {
    // Not in competitive context, ignore
  }

  // Determine which values to use based on mode
  const countryCentroids = soloContext.countryCentroids;
  const selectedCountry = competitiveMode
    ? propSelectedCountry
    : soloContext.selectedCountry;
  const selectCountry = competitiveMode
    ? onSelectCountry || (() => {})
    : soloContext.selectCountry;
  const gameStatus = competitiveMode
    ? competitiveContext?.gameState?.status === "playing"
      ? "playing"
      : "idle"
    : soloContext.gameStatus;

  // For competitive mode, build a Set of claimed country codes
  const claimedCountries =
    competitiveMode && competitiveContext?.gameState
      ? new Set(competitiveContext.gameState.claimedCountries.keys())
      : new Set<string>();

  // For solo mode, use guessedCountries
  const guessedCountries = competitiveMode
    ? claimedCountries
    : soloContext.guessedCountries;

  // Get player colors for competitive mode
  const playerColors = competitiveContext?.playerColors;

  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  // Store long-press state
  const longPressTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );
  const startPositions = useRef<Map<string, { x: number; y: number }>>(
    new Map(),
  );
  const cleanupFns = useRef<Map<string, () => void>>(new Map());

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      longPressTimers.current.forEach((timer) => clearTimeout(timer));
      longPressTimers.current.clear();
      cleanupFns.current.forEach((cleanup) => cleanup());
      cleanupFns.current.clear();
    };
  }, []);

  const clearLongPressTimer = useCallback((code: string) => {
    const timer = longPressTimers.current.get(code);
    if (timer) {
      clearTimeout(timer);
      longPressTimers.current.delete(code);
    }
    startPositions.current.delete(code);
  }, []);

  // Attach touch events to marker element
  const attachTouchHandlers = useCallback(
    (code: string, marker: L.Marker | null) => {
      // Cleanup previous handlers
      const existingCleanup = cleanupFns.current.get(code);
      if (existingCleanup) {
        existingCleanup();
        cleanupFns.current.delete(code);
      }

      if (!marker) return;

      const element = marker.getElement();
      if (!element) return;

      const handleTouchStart = (e: TouchEvent) => {
        if (e.touches.length !== 1) {
          clearLongPressTimer(code);
          return;
        }
        const touch = e.touches[0];
        startPositions.current.set(code, {
          x: touch.clientX,
          y: touch.clientY,
        });

        const timer = setTimeout(() => {
          if (gameStatus === "playing" && onCountryDoubleClick) {
            selectCountry(code);
            onCountryDoubleClick();
          }
          longPressTimers.current.delete(code);
        }, LONG_PRESS_THRESHOLD);

        longPressTimers.current.set(code, timer);
      };

      const handleTouchMove = (e: TouchEvent) => {
        const startPos = startPositions.current.get(code);
        if (!startPos) return;

        const touch = e.touches[0];
        if (!touch) {
          clearLongPressTimer(code);
          return;
        }

        const deltaX = Math.abs(touch.clientX - startPos.x);
        const deltaY = Math.abs(touch.clientY - startPos.y);

        if (deltaX > MOVE_TOLERANCE || deltaY > MOVE_TOLERANCE) {
          clearLongPressTimer(code);
        }
      };

      const handleTouchEnd = () => {
        clearLongPressTimer(code);
      };

      element.addEventListener("touchstart", handleTouchStart, {
        passive: true,
      });
      element.addEventListener("touchmove", handleTouchMove, { passive: true });
      element.addEventListener("touchend", handleTouchEnd, { passive: true });
      element.addEventListener("touchcancel", handleTouchEnd, {
        passive: true,
      });

      cleanupFns.current.set(code, () => {
        clearLongPressTimer(code);
        element.removeEventListener("touchstart", handleTouchStart);
        element.removeEventListener("touchmove", handleTouchMove);
        element.removeEventListener("touchend", handleTouchEnd);
        element.removeEventListener("touchcancel", handleTouchEnd);
      });
    },
    [gameStatus, onCountryDoubleClick, selectCountry, clearLongPressTimer],
  );

  // Handle mousedown via Leaflet event system
  const handleMouseDown = useCallback(
    (code: string, e: L.LeafletMouseEvent) => {
      const startX = e.originalEvent.clientX;
      const startY = e.originalEvent.clientY;
      startPositions.current.set(code, { x: startX, y: startY });

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = Math.abs(moveEvent.clientX - startX);
        const deltaY = Math.abs(moveEvent.clientY - startY);

        if (deltaX > MOVE_TOLERANCE || deltaY > MOVE_TOLERANCE) {
          clearLongPressTimer(code);
          cleanup();
        }
      };

      const handleMouseUp = () => {
        clearLongPressTimer(code);
        cleanup();
      };

      const cleanup = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      const timer = setTimeout(() => {
        if (gameStatus === "playing" && onCountryDoubleClick) {
          selectCountry(code);
          onCountryDoubleClick();
        }
        longPressTimers.current.delete(code);
        cleanup();
      }, LONG_PRESS_THRESHOLD);

      longPressTimers.current.set(code, timer);
    },
    [gameStatus, onCountryDoubleClick, selectCountry, clearLongPressTimer],
  );

  return (
    <>
      {SMALL_COUNTRY_CIRCLES.map((code) => {
        const centroid = countryCentroids.get(code);
        if (!centroid) return null;

        const isGuessed = guessedCountries.has(code);
        const isSelected = selectedCountry === code;
        const isHovered = hoveredCountry === code;

        // For competitive mode, get the claimer's color
        const claimerId =
          competitiveMode && competitiveContext?.gameState
            ? competitiveContext.gameState.claimedCountries.get(code)
            : null;
        const claimerColor =
          claimerId && playerColors ? playerColors.get(claimerId) : null;

        // Determine colors based on state
        let color: string;
        let fillColor: string;
        let fillOpacity: number;
        let dashed: boolean;

        if (isGuessed) {
          // Use claimer's color in competitive mode, green in solo
          color = claimerColor || "#22c55e";
          fillColor = claimerColor || "#22c55e";
          fillOpacity = 0.3;
          dashed = false;
        } else if (isSelected) {
          color = competitiveMode ? "#fbbf24" : "#ec4899"; // Yellow in competitive, pink in solo
          fillColor = competitiveMode ? "#fbbf24" : "#ec4899";
          fillOpacity = 0.3;
          dashed = false;
        } else if (isHovered) {
          color = "#fbbf24"; // Yellow
          fillColor = "#fbbf24";
          fillOpacity = 0.3;
          dashed = false;
        } else {
          color = "#6b7280"; // Gray
          fillColor = "transparent";
          fillOpacity = 0;
          dashed = true;
        }

        const icon = createCircleIcon(color, fillColor, fillOpacity, dashed);

        return (
          <Marker
            key={`${code}-${isGuessed}-${isSelected}-${isHovered}`}
            position={[centroid.lat, centroid.lng]}
            icon={icon}
            ref={(marker) => attachTouchHandlers(code, marker)}
            eventHandlers={{
              click: () => {
                if (gameStatus === "playing") {
                  selectCountry(code);
                }
              },
              dblclick: () => {
                if (
                  gameStatus === "playing" &&
                  selectedCountry === code &&
                  onCountryDoubleClick
                ) {
                  onCountryDoubleClick();
                }
              },
              mousedown: (e) => {
                handleMouseDown(code, e);
              },
              mouseover: () => {
                if (gameStatus === "playing" && !isGuessed && !isSelected) {
                  setHoveredCountry(code);
                }
              },
              mouseout: () => {
                setHoveredCountry(null);
              },
            }}
          />
        );
      })}
    </>
  );
}
