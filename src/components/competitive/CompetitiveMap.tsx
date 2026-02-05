import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GeoJSON, MapContainer, TileLayer, useMap } from "react-leaflet";

import L from "leaflet";

import { MapControls } from "@/components/MapControls";
import { SmallCountryCircles } from "@/components/SmallCountryCircles";
import { useCompetitive } from "@/contexts/CompetitiveContext";
import { attachLongPressToLayer } from "@/hooks/useLongPress";
import { getCountryFlagEmoji } from "@/lib/utils";
import type { CountriesGeoJSON, CountryFeature } from "@/types/country";

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

interface CompetitiveMapProps {
  onCountryDoubleClick?: () => void;
  selectedCountry?: string | null;
  onSelectCountry?: (code: string | null) => void;
}

export function CompetitiveMap({
  onCountryDoubleClick,
  selectedCountry: propSelectedCountry,
  onSelectCountry,
}: CompetitiveMapProps) {
  const { gameState, playerColors, isEliminated } = useCompetitive();
  const [countries, setCountries] = useState<CountryFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [internalSelectedCountry, setInternalSelectedCountry] = useState<
    string | null
  >(null);
  const resetViewRef = useRef<(() => void) | null>(null);

  // Use prop if provided, otherwise use internal state
  const selectedCountry = propSelectedCountry ?? internalSelectedCountry;
  const setSelectedCountry = onSelectCountry ?? setInternalSelectedCountry;

  // Load GeoJSON data
  useEffect(() => {
    fetch("/data/countries.geojson")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load countries data");
        return res.json();
      })
      .then((data: CountriesGeoJSON) => {
        setCountries(data.features);
        setLoading(false);
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error("Error loading countries:", err);
        setLoading(false);
      });
  }, []);

  const geoJsonData = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: countries,
    }),
    [countries],
  );

  const getCountryStyle = useCallback(
    (feature: CountryFeature | undefined) => {
      if (!feature || !gameState) return {};

      const code = feature.properties.ISO_A2;
      const claimerId = gameState.claimedCountries.get(code);
      const isSelected = selectedCountry === code;

      if (claimerId) {
        // Claimed by a player
        const playerColor = playerColors.get(claimerId) || "#22c55e";
        return {
          fillColor: playerColor,
          fillOpacity: isSelected ? 0.9 : 0.7,
          color: isSelected ? "#000000" : "#1f2937",
          weight: isSelected ? 2 : 1,
        };
      } else if (isSelected) {
        // Selected but unclaimed
        return {
          fillColor: "#fbbf24", // yellow
          fillOpacity: 0.7,
          color: "#1f2937",
          weight: 2,
        };
      } else {
        // Unclaimed
        return {
          fillColor: "#e5e7eb",
          fillOpacity: 0.3,
          color: "#1f2937",
          weight: 1,
        };
      }
    },
    [gameState, playerColors, selectedCountry],
  );

  const onEachFeature = useCallback(
    (feature: CountryFeature, layer: L.Layer) => {
      if (!gameState) return;

      const code = feature.properties.ISO_A2;
      const name = feature.properties.NAME;
      const claimerId = gameState.claimedCountries.get(code);

      // Disable default outline on focus
      if (layer instanceof L.Path) {
        layer.options.interactive = true;
        (layer as PathWithElement)._path?.setAttribute("outline", "none");
      }

      layer.on({
        click: () => {
          if (gameState.status === "playing" && !isEliminated) {
            setSelectedCountry(code);
          }
        },
        dblclick: () => {
          if (
            gameState.status === "playing" &&
            !isEliminated &&
            selectedCountry === code &&
            !claimerId &&
            onCountryDoubleClick
          ) {
            onCountryDoubleClick();
          }
        },
        mouseover: (e) => {
          if (gameState.status !== "playing" || isEliminated) return;
          const target = e.target;
          const isSelected = selectedCountry === code;
          if (!claimerId && !isSelected) {
            target.setStyle({
              fillColor: "#fbbf24",
              fillOpacity: 0.5,
            });
          }
        },
        mouseout: (e) => {
          if (gameState.status !== "playing" || isEliminated) return;
          const target = e.target;
          const isSelected = selectedCountry === code;
          if (!claimerId && !isSelected) {
            target.setStyle(getCountryStyle(feature));
          }
        },
      });

      // Add long-press handler for mobile/desktop
      attachLongPressToLayer(layer, {
        onLongPress: () => {
          if (
            gameState.status === "playing" &&
            !isEliminated &&
            !claimerId &&
            onCountryDoubleClick
          ) {
            setSelectedCountry(code);
            onCountryDoubleClick();
          }
        },
      });

      // Show tooltip for claimed countries
      if (claimerId) {
        const claimer = gameState.players.get(claimerId);
        const flagEmoji = getCountryFlagEmoji(code);
        const claimerName = claimer?.nickname || "Unknown";
        const tooltipContent = flagEmoji
          ? `${flagEmoji} ${name} (${claimerName})`
          : `${name} (${claimerName})`;
        layer.bindTooltip(tooltipContent, {
          sticky: true,
          direction: "top",
        });
      }
    },
    [
      gameState,
      selectedCountry,
      onCountryDoubleClick,
      getCountryStyle,
      setSelectedCountry,
      isEliminated,
    ],
  );

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
    <div className="relative h-full w-full">
      <MapControls onResetView={handleResetView} />
      <MapContainer
        center={[20, 0]}
        zoom={3}
        minZoom={2}
        maxZoom={6}
        maxBounds={[
          [-85, -180],
          [85, 180],
        ]}
        maxBoundsViscosity={1.0}
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
          key={`competitive-geojson-${gameState?.claimedCountries.size}-${selectedCountry}`}
          data={geoJsonData}
          style={getCountryStyle as L.StyleFunction}
          onEachFeature={onEachFeature as L.GeoJSONOptions["onEachFeature"]}
        />
        <SmallCountryCircles
          onCountryDoubleClick={onCountryDoubleClick}
          competitiveMode
          selectedCountry={selectedCountry}
          onSelectCountry={setSelectedCountry}
        />
      </MapContainer>
    </div>
  );
}
