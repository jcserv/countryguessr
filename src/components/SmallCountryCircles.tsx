import { useState } from "react";
import { Marker } from "react-leaflet";

import L from "leaflet";

import { useGameContext } from "@/contexts/GameContext";
import { SMALL_COUNTRY_CIRCLES } from "@/lib/countryNavigation";

interface SmallCountryCirclesProps {
  onCountryDoubleClick?: () => void;
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

export function SmallCountryCircles({
  onCountryDoubleClick,
}: SmallCountryCirclesProps) {
  const {
    countryCentroids,
    guessedCountries,
    selectedCountry,
    selectCountry,
    gameStatus,
  } = useGameContext();

  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  return (
    <>
      {SMALL_COUNTRY_CIRCLES.map((code) => {
        const centroid = countryCentroids.get(code);
        if (!centroid) return null;

        const isGuessed = guessedCountries.has(code);
        const isSelected = selectedCountry === code;
        const isHovered = hoveredCountry === code;

        // Determine colors based on state
        let color: string;
        let fillColor: string;
        let fillOpacity: number;
        let dashed: boolean;

        if (isGuessed) {
          color = "#22c55e"; // Green
          fillColor = "#22c55e";
          fillOpacity = 0.3;
          dashed = false;
        } else if (isSelected) {
          color = "#ec4899"; // Pink
          fillColor = "#ec4899";
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
