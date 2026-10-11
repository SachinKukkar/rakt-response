"use client";

import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import { roundCoordinate, type LatLng } from "@/lib/geo";

function ClickHandler({ onPick }: { onPick: (value: LatLng) => void }) {
  useMapEvents({
    click(event) {
      onPick({ lat: roundCoordinate(event.latlng.lat), lng: roundCoordinate(event.latlng.lng) });
    },
  });
  return null;
}

/**
 * Optional approximate-location picker using OpenStreetMap tiles. Loaded only
 * when the donor asks for it; the form works fully without it.
 * Tile usage must follow https://operations.osmfoundation.org/policies/tiles/
 */
export default function LocationPicker({ value, onChange }: { value: LatLng | null; onChange: (value: LatLng) => void }) {
  const center: [number, number] = value ? [value.lat, value.lng] : [22.5, 79];
  return (
    <div className="overflow-hidden rounded-2xl border">
      <MapContainer
        center={center}
        zoom={value ? 12 : 4}
        scrollWheelZoom={false}
        className="h-64 w-full"
        attributionControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={15}
        />
        <ClickHandler onPick={onChange} />
        {value ? (
          <CircleMarker
            center={[value.lat, value.lng]}
            radius={18}
            pathOptions={{ color: "#C82032", fillColor: "#C82032", fillOpacity: 0.2, weight: 2 }}
          />
        ) : null}
      </MapContainer>
    </div>
  );
}
