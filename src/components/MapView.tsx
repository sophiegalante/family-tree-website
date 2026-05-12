import { useState, useMemo, useEffect, useRef } from "react";
import { type FamilyMember } from "@/data/familyData";
import { useFamilyMembers } from "@/hooks/useFamilyMembers";
import MemberDetail from "./MemberDetail";

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
  const clusterGroupRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [selected, setSelected] = useState<FamilyMember | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Set<EventType>>(new Set(eventTypes));

  const locationGroups = useMemo(() => {
    const groups: Record<string, LocationGroup> = {};

    function addEvent(
      lat: number | undefined,
      lng: number | undefined,
      place: string | undefined,
      type: string,
      member: FamilyMember,
      detail: string,
    ) {
      if (lat == null || lng == null) return;
      const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;
      if (!groups[key]) {
        groups[key] = { lat, lng, placeName: place ?? '', events: [] };
      }
      groups[key].events.push({ type, member, detail });
    }

    members.forEach((m) => {
      addEvent(m.birthLat, m.birthLng, m.birthPlace, "birth", m, `Born ${m.birthDate}`);
      addEvent(m.deathLat, m.deathLng, m.deathPlace, "death", m, `Died ${m.deathDate || ""}`);
      addEvent(m.marriageLat, m.marriageLng, m.marriagePlace, "marriage", m, `Married ${m.spouseName || ""}, ${m.marriageDate || ""}`);
      addEvent(m.baptismLat, m.baptismLng, m.baptismPlace, "baptism", m, `Baptised ${m.baptismDate || ""}`);
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
    const clusterGroup = clusterGroupRef.current;
    if (!L || !clusterGroup) return;

    clusterGroup.clearLayers();
    markersRef.current = [];

    locationGroups.forEach((group) => {
      const filteredEvents = group.events.filter((ev) => activeFilters.has(ev.type as EventType));
      if (filteredEvents.length === 0) return;

      const popupContent = `
        <div style="font-family: system-ui, sans-serif; max-width: 280px;">
          <h3 style="margin:0 0 8px; font-size:14px; font-weight:600;">${group.placeName}</h3>
          <div style="max-height:220px; overflow-y:auto; padding-right:4px;">
            ${filteredEvents
              .map(
                (ev) => `
              <div style="font-size:12px; margin-bottom:6px; display:flex; gap:4px; align-items:flex-start;">
                <span style="flex-shrink:0;">${typeLabels[ev.type] || ""}</span>
                <span><strong>${ev.member.firstName} ${ev.member.lastName}</strong> — ${ev.detail}</span>
              </div>`
              )
              .join("")}
          </div>
        </div>
      `;

      const marker = L.marker([group.lat, group.lng]).bindPopup(popupContent, { maxWidth: 300 });
      clusterGroup.addLayer(marker);
      markersRef.current.push(marker);
    });
  }, [activeFilters, locationGroups, mapLoaded]);

  useEffect(() => {
    if (mapInstanceRef.current || !mapRef.current) return;

    function loadCss(href: string) {
      const el = document.createElement("link");
      el.rel = "stylesheet";
      el.href = href;
      document.head.appendChild(el);
    }

    function loadScript(src: string, onload: () => void) {
      const el = document.createElement("script");
      el.src = src;
      el.onload = onload;
      document.head.appendChild(el);
    }

    loadCss("https://unpkg.com/leaflet@1.9.4/dist/leaflet.css");
    loadCss("https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css");
    loadCss("https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css");

    loadScript("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js", () => {
      loadScript("https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js", () => {
        const L = (window as any).L;
        if (!L || !mapRef.current) return;

        const map = L.map(mapRef.current).setView([53.5, -1.5], 7);
        mapInstanceRef.current = map;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        const clusterGroup = L.markerClusterGroup({ chunkedLoading: true });
        clusterGroupRef.current = clusterGroup;
        map.addLayer(clusterGroup);

        setMapLoaded(true);
      });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        clusterGroupRef.current = null;
      }
    };
  }, []);

  const filteredCount = locationGroups.filter((g) =>
    g.events.some((ev) => activeFilters.has(ev.type as EventType))
  ).length;

  return (
    <div className="space-y-4">
      {/* Legend & Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {eventTypes.map((type) => (
          <button
            key={type}
            onClick={() => toggleFilter(type)}
            disabled={isLoading}
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

      {/* Map container — always rendered so mapRef is available for Leaflet init */}
      <div className="relative overflow-hidden rounded-xl border border-border shadow-lg" style={{ height: "600px" }}>
        {(isLoading || !mapLoaded) && (
          <div className="absolute inset-0 z-10 flex h-full items-center justify-center bg-secondary text-muted-foreground">
            {isLoading ? "Loading map data…" : "Loading map…"}
          </div>
        )}
        <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
      </div>

      {selected && (
        <MemberDetail member={selected} onClose={() => setSelected(null)} members={members} />
      )}
    </div>
  );
}
