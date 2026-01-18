export interface CountryProperties {
  NAME: string;
  NAME_LONG: string;
  ISO_A2: string;
  REGION_UN: string;
  SUBREGION: string;
}

export interface CountryFeature extends GeoJSON.Feature {
  properties: CountryProperties;
  geometry: GeoJSON.MultiPolygon | GeoJSON.Polygon;
}

export interface CountriesGeoJSON extends GeoJSON.FeatureCollection {
  type: "FeatureCollection";
  features: CountryFeature[];
}
