import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  Polyline,
} from "react-leaflet";
import { useState } from "react";
import L, {
  type LeafletMouseEvent,
  type LatLngExpression,
  type DivIcon,
} from "leaflet";
import { a } from "framer-motion/client";

// Read Google API key from env (Vite exposes import.meta.env)
const GOOGLE_API_KEY: string | undefined = (import.meta as any).env
  ?.VITE_GOOGLE_MAPS_API_KEY;

type City = {
  id: number;
  name: string;
  lat: number;
  lng: number;
  removing?: boolean;
  resolving?: boolean;
};

type Props = {
  cities: City[];
  setCities: React.Dispatch<React.SetStateAction<City[]>>;
  startCityId: number | null;
  setStartCityId: React.Dispatch<React.SetStateAction<number | null>>;
  routeOrder?: number[] | null;
  setRouteOrder: React.Dispatch<React.SetStateAction<number[] | null>>;
};
// small in-memory cache for reverse geocoding results keyed by rounded coords
const reverseGeocodeCache = new Map<string, string>();

async function reverseGeocodeGoogle(
  lat: number,
  lon: number,
  key: string
): Promise<string | null> {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${encodeURIComponent(
    key
  )}&language=es`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Google reverse geocode failed");
  const data = await res.json();
  if (!data || !data.results || data.results.length === 0) return null;

  // Prefer locality / political components
  const primary = data.results[0];
  const comps: any[] = primary.address_components || [];
  const findType = (types: string[]) => {
    const el = comps.find((c) => types.some((t) => c.types.includes(t)));
    return el ? el.long_name : null;
  };

  const name =
    findType(["locality"]) ||
    findType(["postal_town"]) ||
    findType(["administrative_area_level_2"]) ||
    findType(["administrative_area_level_1"]) ||
    primary.formatted_address ||
    null;

  return name;
}

function ClickHandler({
  cities,
  setCities,
  setRouteOrder,
}: {
  cities: City[];
  setCities: React.Dispatch<React.SetStateAction<City[]>>;
  setRouteOrder: React.Dispatch<React.SetStateAction<number[] | null>>;
}) {
  useMapEvents({
    click(e: LeafletMouseEvent) {
      setRouteOrder(null); // clear existing route on new city add
      const lat = Number(e.latlng.lat.toFixed(6));
      const lng = Number(e.latlng.lng.toFixed(6));
      const maxId = cities.length ? Math.max(...cities.map((c) => c.id)) : 0;
      const id = maxId + 1;

      // provisional entry while resolving
      const provisional: City = {
        id,
        name: "Resolving...",
        lat,
        lng,
        resolving: true,
      };
      setCities((prev) => [...prev, provisional]);

      (async () => {
        try {
          const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
          let resolvedName = reverseGeocodeCache.get(cacheKey);
          if (!resolvedName) {
            try {
              if (GOOGLE_API_KEY) {
                const googleName = await reverseGeocodeGoogle(
                  lat,
                  lng,
                  GOOGLE_API_KEY
                );
                if (googleName) resolvedName = googleName;
              }
            } catch (gErr) {
              console.warn(
                "Google reverse geocode failed, falling back to Nominatim",
                gErr
              );
            }

            if (resolvedName) reverseGeocodeCache.set(cacheKey, resolvedName);
          }

          setCities((prev) =>
            prev.map((c) =>
              c.id === id
                ? { ...c, name: resolvedName || `City ${id}`, resolving: false }
                : c
            )
          );
        } catch (err) {
          console.warn("Reverse geocode failed", err);
          setCities((prev) =>
            prev.map((c) =>
              c.id === id ? { ...c, name: `City ${id}`, resolving: false } : c
            )
          );
        }
      })();
    },
  });
  return null;
}

export default function MapView({
  cities,
  setCities,
  startCityId,
  setStartCityId,
  setRouteOrder,
  routeOrder = null,
}: Props) {
  // Center the map on San Pedro Sula, Honduras (small zoom)
  const center: LatLngExpression = [15.5, -88.03];

  const [openPopupId, setOpenPopupId] = useState<number | null>(null);

  const removeWithAnimation = (id: number) => {
    // mark removing
    setCities((prev) =>
      prev.map((c) => (c.id === id ? { ...c, removing: true } : c))
    );
    // wait for animation then remove
    setTimeout(() => {
      setCities((prev) => prev.filter((c) => c.id !== id));
    }, 320);
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden">
      <MapContainer
        center={center}
        zoom={10}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png" />
        <ClickHandler
          cities={cities}
          setCities={setCities}
          setRouteOrder={setRouteOrder}
        />

        {cities.map((c) => {
          const color = startCityId === c.id ? "#6366F1" : "#06B6D4";
          const html = `
            <div class="custom-marker-root ${
              c.removing ? "pop-out" : "pop-in"
            }" style="position:relative">
              <div class="custom-marker-pulse ${
                c.removing ? "" : "anim"
              }" style="background:${color};"></div>
              <div class="custom-marker-dot" style="background:${color};"></div>
            </div>
          `;

          const icon = L.divIcon({
            className: "",
            html,
            iconSize: [34, 34],
            iconAnchor: [17, 17],
          }) as DivIcon;

          return (
            <Marker
              key={c.id}
              position={[c.lat, c.lng] as LatLngExpression}
              icon={icon}
              eventHandlers={{
                click: () => setStartCityId(c.id),
                dblclick: () => setOpenPopupId(c.id),
              }}
            />
          );
        })}

        {/* Draw route polyline when a routeOrder is provided */}
        {routeOrder &&
          routeOrder.length > 0 &&
          (() => {
            // convert route indices into lat/lng pairs
            const points = routeOrder
              .map((idx) => {
                const city = cities[idx];
                if (!city) return null;
                return [city.lat, city.lng] as LatLngExpression;
              })
              .filter((p): p is LatLngExpression => p !== null);

            if (points.length === 0) return null;

            // close the loop by returning to the first point
            const closed = points.concat([points[0]]);

            return (
              <>
                <Polyline
                  positions={closed}
                  pathOptions={{ color: "#ef4444", weight: 4, opacity: 0.9 }}
                />
                {/* small numbered labels for route order */}
                {points.map((pt, i) => {
                  const html = `<div class="route-label">${i + 1}</div>`;
                  const icon = L.divIcon({
                    className: "route-label-icon",
                    html,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12],
                  });
                  return (
                    <Marker
                      key={`route-label-${i}`}
                      position={pt}
                      icon={icon as DivIcon}
                      interactive={false}
                    />
                  );
                })}
              </>
            );
          })()}

        {/* Controlled Popup: opens only when a marker is double-clicked */}
        {openPopupId !== null &&
          (() => {
            const pc = cities.find((x) => x.id === openPopupId);
            if (!pc) return null;
            return (
              <Popup
                position={[pc.lat, pc.lng]}
                eventHandlers={{ remove: () => setOpenPopupId(null) }}
              >
                <div className="text-sm">
                  <div>
                    <strong>{pc.name}</strong>
                    <div className="text-xs text-slate-600">
                      {pc.lat.toFixed(4)}, {pc.lng.toFixed(4)}
                    </div>
                    <div className="mt-2 flex">
                      <button
                        onClick={() => {
                          removeWithAnimation(pc.id);
                          setOpenPopupId(null);
                        }}
                        className="text-xs text-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </Popup>
            );
          })()}
      </MapContainer>

      {/* subtle wave overlay for texture */}
      <div
        aria-hidden
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        <svg
          viewBox="0 0 800 200"
          preserveAspectRatio="none"
          style={{
            width: "100%",
            height: 120,
            position: "absolute",
            bottom: 0,
            left: 0,
            opacity: 0.06,
            filter: "blur(6px)",
          }}
        >
          <defs>
            <linearGradient id="g1" x1="0" x2="1">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>
          </defs>
          <path
            d="M0,100 C150,10 350,190 800,80 L800,200 L0,200 Z"
            fill="url(#g1)"
          />
        </svg>
      </div>
    </div>
  );
}
