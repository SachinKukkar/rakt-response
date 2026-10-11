"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Crosshair, Map as MapIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mapEnabled } from "@/lib/env";
import { roundCoordinate, type LatLng } from "@/lib/geo";

const LocationPicker = dynamic(() => import("./location-picker"), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse rounded-2xl bg-muted" aria-label="Loading map" />,
});

/**
 * Optional approximate location. Never required, never precise: coordinates
 * are rounded to ~1 km in the browser and again in the database.
 */
export function ApproxLocation({ value, onChange }: { value: LatLng | null; onChange: (value: LatLng | null) => void }) {
  const [showMap, setShowMap] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  function useDeviceLocation() {
    setGeoError(null);
    if (!("geolocation" in navigator)) {
      setGeoError("Location is not available on this device. You can skip this step.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        onChange({ lat: roundCoordinate(position.coords.latitude), lng: roundCoordinate(position.coords.longitude) });
      },
      () => {
        setLocating(false);
        setGeoError("We couldn't get your location. That's fine — your area details above are enough.");
      },
      { enableHighAccuracy: false, maximumAge: 600_000, timeout: 10_000 },
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border border-dashed bg-white/60 p-4">
      <div>
        <p className="text-sm font-semibold text-navy">Approximate location (optional)</p>
        <p className="text-xs text-muted-foreground">
          Helps volunteers find nearby donors. We store it rounded to about 1 km and never show it publicly.
        </p>
      </div>
      {value ? (
        <div className="flex items-center justify-between gap-2 rounded-xl bg-accent/60 px-3 py-2 text-sm">
          <span>
            Approximately {value.lat.toFixed(2)}, {value.lng.toFixed(2)}
          </span>
          <Button type="button" variant="ghost" size="icon-sm" onClick={() => onChange(null)} aria-label="Remove approximate location">
            <X className="size-4" />
          </Button>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={useDeviceLocation} disabled={locating}>
          <Crosshair className="size-4" aria-hidden="true" />
          {locating ? "Locating…" : "Use my approximate location"}
        </Button>
        {mapEnabled ? (
          <Button type="button" variant="outline" size="sm" onClick={() => setShowMap((v) => !v)} aria-expanded={showMap}>
            <MapIcon className="size-4" aria-hidden="true" />
            {showMap ? "Hide map" : "Pick on a map"}
          </Button>
        ) : null}
      </div>
      {geoError ? <p className="text-xs text-warning">{geoError}</p> : null}
      {showMap && mapEnabled ? <LocationPicker value={value} onChange={onChange} /> : null}
    </div>
  );
}
