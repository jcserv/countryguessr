import { useCallback, useEffect, useMemo, useRef } from "react";
import { GeoJSON, MapContainer, TileLayer, useMap } from "react-leaflet";

import L from "leaflet";

import { MapControls } from "@/components/MapControls";
import { useGameContext } from "@/contexts/GameContext";
import { getCountryFlagEmoji } from "@/lib/utils";
import type { CountryFeature } from "@/types/country";

// Type for Leaflet Path with internal _path property
interface PathWithElement extends L.Path {
  _path?: SVGElement | null;
}

// Component to handle map reset
function MapResetHandler({
  resetViewRef,
}: {
  resetViewRef: React.MutableRefObject<(() => void) | null>;
}) {
  const map = useMap();

  resetViewRef.current = useCallback(() => {
    map.setView([20, 0], 3);
  }, [map]);

  return null;
}

interface GameMapProps {
  dimmed?: boolean;
  onCountryDoubleClick?: () => void;
}

export function GameMap({
  dimmed = false,
  onCountryDoubleClick,
}: GameMapProps) {
  const {
    countries,
    guessedCountries,
    selectedCountry,
    selectCountry,
    loading,
    gameStatus,
    registerMapResetHandler,
  } = useGameContext();
  const resetViewRef = useRef<(() => void) | null>(null);

  // Register the map reset handler with the context
  useEffect(() => {
    registerMapResetHandler(() => {
      resetViewRef.current?.();
    });
  }, [registerMapResetHandler]);

  // Create GeoJSON data structure
  const geoJsonData = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: countries,
    }),
    [countries],
  );

  // Style function for countries
  const getCountryStyle = (feature: CountryFeature | undefined) => {
    if (!feature) return {};

    const code = feature.properties.ISO_A2;
    const isGuessed = guessedCountries.has(code);
    const isSelected = selectedCountry === code;

    // Three states: guessed (green), selected (pink), default (gray)
    if (isGuessed) {
      return {
        fillColor: "#22c55e",
        fillOpacity: 0.7,
        color: "#1f2937",
        weight: 1,
      };
    } else if (isSelected) {
      return {
        fillColor: "#ec4899",
        fillOpacity: 0.7,
        color: "#1f2937",
        weight: 2,
      };
    } else {
      return {
        fillColor: "#e5e7eb",
        fillOpacity: 0.3,
        color: "#1f2937",
        weight: 1,
      };
    }
  };

  // Handler for each feature (country polygon)
  const onEachFeature = (feature: CountryFeature, layer: L.Layer) => {
    const code = feature.properties.ISO_A2;
    const name = feature.properties.NAME;

    // Disable default outline on focus
    if (layer instanceof L.Path) {
      layer.options.interactive = true;
      (layer as PathWithElement)._path?.setAttribute("outline", "none");
    }

    // Add click handler
    layer.on({
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
      mouseover: (e) => {
        if (gameStatus !== "playing") return;
        const target = e.target;
        const isSelected = selectedCountry === code;
        if (!guessedCountries.has(code) && !isSelected) {
          target.setStyle({
            fillColor: "#fbbf24",
            fillOpacity: 0.5,
          });
        }
      },
      mouseout: (e) => {
        if (gameStatus !== "playing") return;
        const target = e.target;
        const isSelected = selectedCountry === code;
        if (!guessedCountries.has(code) && !isSelected) {
          target.setStyle(getCountryStyle(feature));
        }
      },
    });

    // Only show country name tooltip if it's been guessed correctly
    if (guessedCountries.has(code)) {
      const flagEmoji = getCountryFlagEmoji(code);
      const tooltipContent = flagEmoji ? `${flagEmoji} ${name}` : name;
      layer.bindTooltip(tooltipContent, {
        sticky: true,
        direction: "top",
      });
    }
  };

  const handleResetView = useCallback(() => {
    resetViewRef.current?.();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center bg-gray-100 h-full">
        <p className="text-lg">Loading map...</p>
      </div>
    );
  }

  return (
    <div className={`relative h-full w-full ${dimmed ? "opacity-50" : ""}`}>
      <MapControls onResetView={handleResetView} />
      <MapContainer
        center={[20, 0]}
        zoom={3}
        minZoom={3}
        maxZoom={6}
        scrollWheelZoom={true}
        doubleClickZoom={false}
        keyboard={false}
        worldCopyJump={true}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <MapResetHandler resetViewRef={resetViewRef} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />
        <GeoJSON
          key={`geojson-${gameStatus}-${guessedCountries.size}-${selectedCountry}`}
          data={geoJsonData}
          style={(feature) => getCountryStyle(feature as CountryFeature)}
          onEachFeature={(feature, layer) =>
            onEachFeature(feature as CountryFeature, layer)
          }
        />
      </MapContainer>
    </div>
  );
}
