export interface LatLng {
  lat: number;
  lng: number;
}

/** Rounds to 2 decimals (~1 km) so a precise home location is never stored. */
export function roundCoordinate(value: number): number {
  return Math.round(value * 100) / 100;
}
