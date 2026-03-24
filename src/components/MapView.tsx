import { useState, useMemo, useEffect, useRef } from "react";
import { type FamilyMember } from "@/data/familyData";
import { useFamilyMembers } from "@/hooks/useFamilyMembers";
import MemberDetail from "./MemberDetail";

// Approximate geocoding for known places
const placeCoords: Record<string, [number, number]> = {
  "caldwell": [54.503, -1.725],
  "stanwick st john": [54.492, -1.694],
  "forcett": [54.518, -1.732],
  "east layton": [54.489, -1.719],
  "richmond": [54.403, -1.737],
  "richmond, yorkshire": [54.403, -1.737],
  "richmond, surrey": [51.461, -0.301],
  "marske by richmond": [54.407, -1.777],
  "marske by richmond, yorkshire": [54.407, -1.777],
  "dalton, yorkshire": [54.474, -1.703],
  "gayles": [54.470, -1.827],
  "gayles fields": [54.470, -1.827],
  "kirby ravensworth": [54.448, -1.825],
  "kirby ravensworth, yorkshire": [54.448, -1.825],
  "melsonby": [54.460, -1.680],
  "melsonby, yorkshire": [54.460, -1.680],
  "wycliffe, yorkshire": [54.530, -1.850],
  "west layton": [54.490, -1.716],
  "keighley": [53.868, -1.912],
  "keighley, yorkshire": [53.868, -1.912],
  "worth valley": [53.850, -1.950],
  "worth valley, yorkshire": [53.850, -1.950],
  "staincliffe, yorkshire": [53.680, -1.850],
  "bradford, yorkshire": [53.795, -1.759],
  "leyburn, yorkshire": [54.310, -1.831],
  "aldbrough, yorkshire": [53.836, -0.249],
  "darlington": [54.524, -1.553],
  "south church": [54.661, -1.670],
  "bishop auckland": [54.661, -1.670],
  "auckland, co durham": [54.661, -1.670],
  "new shildon": [54.624, -1.644],
  "shildon, co durham": [54.624, -1.644],
  "chester le street": [54.858, -1.572],
  "chester le street, co durham": [54.858, -1.572],
  "lamesley, chester le street, co durham": [54.912, -1.593],
  "houghton": [54.841, -1.470],
  "houghton le spring": [54.841, -1.470],
  "heseldon, co durham": [54.758, -1.307],
  "west rainton": [54.815, -1.493],
  "west rainton, co durham": [54.815, -1.493],
  "low moorsley": [54.830, -1.450],
  "low moorsley, co durham": [54.830, -1.450],
  "moorsley, co durham": [54.830, -1.450],
  "east rainton": [54.815, -1.470],
  "lanchester": [54.803, -1.758],
  "lanchester, co durham": [54.803, -1.758],
  "easington": [54.786, -1.353],
  "easington, co durham": [54.786, -1.353],
  "quarrington hill, co durham": [54.730, -1.500],
  "durham": [54.776, -1.575],
  "pittington": [54.785, -1.493],
  "pittington, co durham": [54.785, -1.493],
  "boldon colliery": [54.942, -1.460],
  "gateshead": [54.959, -1.603],
  "gateshead, co durham": [54.959, -1.603],
  "hebburn": [54.972, -1.513],
  "south shields": [54.997, -1.430],
  "jarrow, co durham": [54.980, -1.490],
  "waldridge, co durham": [54.844, -1.590],
  "pelton, co durham": [54.859, -1.600],
  "shadforth": [54.753, -1.480],
  "belmont, co durham": [54.797, -1.540],
  "monk hesleden, co durham": [54.750, -1.310],
  "framwellgate moor, co durham": [54.800, -1.580],
  "castle eden, co durham": [54.735, -1.350],
  "kibblesworth, county durham": [54.905, -1.630],
  "sunderland": [54.907, -1.381],
  "sunderland, co durham": [54.907, -1.381],
  "wingate, co durham": [54.722, -1.381],
  "rotherham": [53.432, -1.357],
  "newcastle": [54.978, -1.614],
  "newcastle, northumberland": [54.978, -1.614],
  "northallerton": [54.339, -1.430],
  "northumberland, england": [55.200, -2.000],
  "london": [51.507, -0.128],
  "lambeth, london": [51.490, -0.117],
  "oldham": [53.541, -2.118],
  "oldham, lancashire": [53.541, -2.118],
  "chorley, lancashire": [53.653, -2.632],
  "droxford, hampshire": [50.955, -1.148],
  "rother valley": [53.370, -1.300],
  "ohio": [40.417, -82.907],
  "irondale, jefferson county, ohio": [40.382, -80.680],
  "canton, stark, ohio": [40.799, -81.379],
  "saline, jefferson county": [40.350, -80.700],
  "jefferson, adams, ohio": [38.754, -83.559],
  "columbiana, ohio": [40.888, -80.690],
  "stark, ohio": [40.814, -81.366],
  "lima, ohio": [40.743, -84.105],
  "fort shawnee, allen, ohio": [40.800, -84.140],
  "seattle, king, washington, usa": [47.606, -122.332],
  "warm beach, washington, usa": [48.167, -122.367],
  "hammondsville": [40.547, -80.714],
  "west virginia": [38.597, -80.455],
  "weirton, hancock, west virginia": [40.419, -80.589],
  "hancock, west virginia": [40.480, -80.570],
  "new cumberland, hancock, west virginia": [40.497, -80.609],
  "brooke, west virginia": [40.270, -80.578],
  "titusville, pennsylvania": [41.627, -79.673],
  "indiana": [40.267, -86.135],
  "indiana, usa": [40.267, -86.135],
  "madison, indiana": [38.736, -85.380],
  "indianapolis": [39.768, -86.158],
  "leesburg, florida": [28.811, -81.877],
  "danville, vermilion county": [40.125, -87.630],
  "vermilion county": [40.180, -87.730],
  "westville, vermilion county": [40.042, -87.639],
  "westville, vermilion county, illinois": [40.042, -87.639],
  "caldwell, idaho": [43.663, -116.688],
  "wisconsin": [43.784, -88.787],
  "monroe, indiana": [40.750, -85.370],
  "ravensworth, co durham": [54.865, -1.578],
  "new durham": [54.780, -1.580],
  "hutton magna, yorkshire": [54.520, -1.770],
};

function normalizePlace(place: string): string {
  return place.toLowerCase().trim().replace(/\s+/g, " ");
}

interface LocationGroup {
  lat: number;
  lng: number;
  placeName: string;
  events: { type: string; member: FamilyMember; detail: string }[];
}

const typeLabels: Record<string, string> = {
  birth: "🟢",
  death: "⚫",
  marriage: "💒",
  baptism: "⛪",
};

const eventTypes = ["birth", "death", "marriage", "baptism"] as const;
type EventType = typeof eventTypes[number];

export default function MapView() {
  const { members, isLoading } = useFamilyMembers();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [selected, setSelected] = useState<FamilyMember | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Set<EventType>>(new Set(eventTypes));

  const locationGroups = useMemo(() => {
    const groups: Record<string, LocationGroup> = {};

    function addEvent(place: string | undefined, type: string, member: FamilyMember, detail: string) {
      if (!place) return;
      const norm = normalizePlace(place);
      const coords = placeCoords[norm];
      if (!coords) return;

      const key = `${coords[0]},${coords[1]}`;
      if (!groups[key]) {
        groups[key] = { lat: coords[0], lng: coords[1], placeName: place, events: [] };
      }
      groups[key].events.push({ type, member, detail });
    }

    members.forEach((m) => {
      addEvent(m.birthPlace, "birth", m, `Born ${m.birthDate}`);
      addEvent(m.deathPlace, "death", m, `Died ${m.deathDate || ""}`);
      addEvent(m.marriagePlace, "marriage", m, `Married ${m.spouseName || ""}, ${m.marriageDate || ""}`);
      addEvent(m.baptismPlace, "baptism", m, `Baptised ${m.baptismDate || ""}`);
    });

    return Object.values(groups);
  }, [members]);

  const toggleFilter = (type: EventType) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  // Update markers when filters change
  useEffect(() => {
    const L = (window as any).L;
    const map = mapInstanceRef.current;
    if (!L || !map) return;

    // Remove existing markers
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    locationGroups.forEach((group) => {
      const filteredEvents = group.events.filter((ev) => activeFilters.has(ev.type as EventType));
      if (filteredEvents.length === 0) return;

      const popupContent = `
        <div style="font-family: system-ui, sans-serif; max-width: 280px;">
          <h3 style="margin:0 0 8px; font-size:14px; font-weight:600;">${group.placeName}</h3>
          <div style="max-height:180px; overflow-y:auto;">
            ${filteredEvents
              .map(
                (ev) => `
              <div style="font-size:12px; margin-bottom:4px; display:flex; gap:4px;">
                <span>${typeLabels[ev.type] || ""}</span>
                <span><strong>${ev.member.firstName} ${ev.member.lastName}</strong> — ${ev.detail}</span>
              </div>`
              )
              .join("")}
          </div>
        </div>
      `;

      const marker = L.marker([group.lat, group.lng]).addTo(map).bindPopup(popupContent);
      markersRef.current.push(marker);
    });
  }, [activeFilters, locationGroups, mapLoaded]);

  useEffect(() => {
    if (mapInstanceRef.current || !mapRef.current) return;

    const linkEl = document.createElement("link");
    linkEl.rel = "stylesheet";
    linkEl.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(linkEl);

    const scriptEl = document.createElement("script");
    scriptEl.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    scriptEl.onload = () => {
      const L = (window as any).L;
      if (!L || !mapRef.current) return;

      const map = L.map(mapRef.current).setView([53.5, -1.5], 7);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      setMapLoaded(true);
    };
    document.head.appendChild(scriptEl);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const filteredCount = locationGroups.filter((g) =>
    g.events.some((ev) => activeFilters.has(ev.type as EventType))
  ).length;

  if (isLoading) {
    return <div className="p-4 text-muted-foreground">Loading map data…</div>;
  }

  return (
    <div className="space-y-4">
      {/* Legend & Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {eventTypes.map((type) => (
          <button
            key={type}
            onClick={() => toggleFilter(type)}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${
              activeFilters.has(type)
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border bg-secondary/50 text-muted-foreground opacity-50"
            }`}
          >
            <span>{typeLabels[type]}</span>
            <span className="capitalize">{type}</span>
          </button>
        ))}
        <span className="text-xs text-muted-foreground">({filteredCount} locations)</span>
      </div>

      {/* Map container */}
      <div className="overflow-hidden rounded-xl border border-border shadow-lg" style={{ height: "600px" }}>
        {!mapLoaded && (
          <div className="flex h-full items-center justify-center bg-secondary text-muted-foreground">
            Loading map...
          </div>
        )}
        <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
      </div>

      {selected && (
        <MemberDetail member={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
