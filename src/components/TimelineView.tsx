import { useState, useMemo } from "react";
import { type FamilyMember } from "@/data/familyData";
import { useFamilyMembers } from "@/hooks/useFamilyMembers";
import { historicalEvents, categoryStyles, type HistoricalEvent } from "@/data/historicalEvents";
import PersonCard from "./PersonCard";
import MemberDetail from "./MemberDetail";

const BRANCH_COLORS: Record<string, string> = {
  p1: "#6366f1",
  p2: "#ec4899",
  p3: "#f59e0b",
  p4: "#10b981",
  p5: "#3b82f6",
  p6: "#ef4444",
  p7: "#8b5cf6",
  p8: "#14b8a6",
};

function countAlive(members: FamilyMember[], event: HistoricalEvent): number {
  const eventStart = event.year;
  const eventEnd = event.endYear ?? event.year;
  return members.filter(
    (m) =>
      m.birthYear <= eventEnd &&
      (m.deathYear === undefined || m.deathYear >= eventStart),
  ).length;
}

function TimelineEvent({
  event,
  allMembers,
}: {
  event: HistoricalEvent;
  allMembers: FamilyMember[];
}) {
  const style = categoryStyles[event.category];
  const alive = countAlive(allMembers, event);

  return (
    <div className="relative flex items-start md:justify-center">
      <div className="absolute left-5 top-3 z-10 h-3 w-3 -translate-x-1/2 rotate-45 border-2 border-primary/50 bg-background md:left-1/2" />
      <div className="ml-10 w-full md:ml-0 md:max-w-lg">
        <div
          className="overflow-hidden rounded-lg border border-border bg-card shadow-sm"
          style={{ borderLeft: `4px solid ${style.borderColor}` }}
        >
          <div className="flex items-start gap-2.5 px-4 py-3">
            <span className="mt-0.5 shrink-0 text-lg">{style.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                {event.name}
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  {event.year}
                  {event.endYear && event.endYear !== event.year ? `–${event.endYear}` : ""}
                </span>
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {event.description}
              </p>
              {alive > 0 && (
                <span className="mt-2 inline-flex items-center gap-1.5 rounded bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  👥 {alive} family {alive === 1 ? "member" : "members"} alive during this event
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EraSection({
  era,
  items,
  selectedLine,
  eraEvents,
  allMembers,
  branchLabelMap,
  onSelect,
}: {
  era: { label: string; range: [number, number]; members: FamilyMember[] };
  items: ({ type: "member"; member: FamilyMember; year: number } | { type: "event"; event: HistoricalEvent; year: number })[];
  selectedLine: string | null;
  eraEvents: HistoricalEvent[];
  allMembers: FamilyMember[];
  branchLabelMap: Record<string, string>;
  onSelect: (m: FamilyMember) => void;
}) {
  return (
    <div className="relative">
      {/* Era header */}
      <div className="sticky top-20 z-10 mb-8">
        <div className="flex items-center gap-4 bg-background py-2">
          <span className="shrink-0 font-display text-2xl font-bold tabular-nums text-foreground">
            {era.label}
          </span>
          <div className="h-px flex-1 bg-border" />
          <span className="shrink-0 whitespace-nowrap text-sm text-muted-foreground">
            {era.members.length} {era.members.length === 1 ? "person" : "people"}
            {!selectedLine && eraEvents.length > 0 ? ` · ${eraEvents.length} events` : ""}
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-4">
        {items.map((item, idx) => {
          if (item.type === "event") {
            return (
              <TimelineEvent
                key={`ev-${item.event.name}`}
                event={item.event}
                allMembers={allMembers}
              />
            );
          }

          const isLeft = idx % 2 === 0;
          const branchColor = !selectedLine ? BRANCH_COLORS[item.member.pageId] : undefined;
          const branchLabel = !selectedLine ? branchLabelMap[item.member.pageId] : undefined;

          return (
            <div
              key={item.member.id}
              className={`relative flex items-start gap-4 ${
                isLeft ? "md:flex-row" : "md:flex-row-reverse"
              }`}
            >
              <div className="absolute left-5 top-4 z-10 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-primary bg-card md:left-1/2" />
              <div
                className={`ml-10 w-full md:ml-0 md:w-[calc(50%-2rem)] ${
                  isLeft ? "md:mr-auto md:pr-8" : "md:ml-auto md:pl-8"
                }`}
              >
                <PersonCard
                  member={item.member}
                  onClick={() => onSelect(item.member)}
                  branchColor={branchColor}
                  branchLabel={branchLabel}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TimelineView() {
  const { members, eras, branches, isLoading } = useFamilyMembers();
  const [selected, setSelected] = useState<FamilyMember | null>(null);
  const [selectedEra, setSelectedEra] = useState<string | null>(null);
  const [selectedLine, setSelectedLine] = useState<string | null>(null);

  const branchLabelMap = useMemo(() => {
    const map: Record<string, string> = {};
    branches.forEach((b) => { map[b.pageId] = b.label; });
    return map;
  }, [branches]);

  const maxEraCount = useMemo(
    () => Math.max(...eras.map((e) => e.members.length), 1),
    [eras],
  );

  if (isLoading) {
    return <div className="p-4 text-muted-foreground">Loading timeline…</div>;
  }

  const visibleEras = eras
    .filter((era) => !selectedEra || era.label === selectedEra)
    .map((era) => ({
      ...era,
      members: selectedLine
        ? era.members.filter((m) => m.pageId === selectedLine)
        : era.members,
    }))
    .filter((era) => era.members.length > 0);

  const activeFilters = (selectedEra ? 1 : 0) + (selectedLine ? 1 : 0);
  const earliest = eras.length ? eras[0].range[0] : "–";
  const latest = eras.length ? eras[eras.length - 1].range[1] : "–";

  return (
    <div>
      {/* ── Filter bar ── */}
      <div className="mb-8 space-y-4">

        {/* Summary stats */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-border pb-4">
          {[
            { value: members.length.toLocaleString(), label: "People" },
            { value: `${earliest}–${latest}`, label: "Timespan" },
            { value: branches.length, label: "Branches" },
            { value: historicalEvents.length, label: "Events" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-sm font-bold text-foreground">{value}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Era filter — pills with density bars */}
        <div className="flex flex-wrap items-start gap-2">
          <span className="w-16 shrink-0 pt-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Era
          </span>
          <button
            onClick={() => setSelectedEra(null)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              !selectedEra
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          {eras.map((era) => (
            <button
              key={era.label}
              onClick={() => setSelectedEra(selectedEra === era.label ? null : era.label)}
              className={`rounded-lg border px-3 pb-2 pt-1.5 text-left transition-colors ${
                selectedEra === era.label
                  ? "border-primary/40 bg-primary/5 text-foreground"
                  : "border-border bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="text-xs font-semibold">{era.label}</div>
              <div className="mt-0.5 text-[10px] text-muted-foreground">
                {era.members.length} people
              </div>
              <div className="mt-1.5 h-0.5 w-full overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-primary/60 transition-all"
                  style={{ width: `${Math.round((era.members.length / maxEraCount) * 100)}%` }}
                />
              </div>
            </button>
          ))}
        </div>

        {/* Branch/line filter — pills with color dots */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-16 shrink-0 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Line
          </span>
          <button
            onClick={() => setSelectedLine(null)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
              !selectedLine
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            All lines
          </button>
          {branches.map((branch) => (
            <button
              key={branch.pageId}
              onClick={() => setSelectedLine(selectedLine === branch.pageId ? null : branch.pageId)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                selectedLine === branch.pageId
                  ? "border-primary/40 bg-primary/5 text-foreground"
                  : "border-border bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: BRANCH_COLORS[branch.pageId] ?? "#aaa" }}
              />
              {branch.label}
            </button>
          ))}
        </div>

        {/* Active filter summary */}
        {activeFilters > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Showing {visibleEras.reduce((n, e) => n + e.members.length, 0)} of{" "}
              {eras.reduce((n, e) => n + e.members.length, 0)} people
            </span>
            <button
              onClick={() => { setSelectedEra(null); setSelectedLine(null); }}
              className="text-xs text-primary hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* ── Timeline ── */}
      {visibleEras.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          No members match the selected filters.
        </p>
      ) : (
        <div className="relative">
          <div className="absolute bottom-0 left-5 top-0 w-0.5 bg-border md:left-1/2 md:-translate-x-px" />
          <div className="space-y-12">
            {visibleEras.map((era) => {
              const eraEvents = historicalEvents.filter(
                (ev) => ev.year >= era.range[0] && ev.year <= era.range[1],
              );

              type TimelineItem =
                | { type: "member"; member: FamilyMember; year: number }
                | { type: "event"; event: HistoricalEvent; year: number };

              const items: TimelineItem[] = [
                ...era.members.map((m) => ({ type: "member" as const, member: m, year: m.birthYear })),
                ...(!selectedLine
                  ? eraEvents.map((e) => ({ type: "event" as const, event: e, year: e.year }))
                  : []),
              ].sort((a, b) => a.year - b.year);

              return (
                <EraSection
                  key={era.label}
                  era={era}
                  items={items}
                  selectedLine={selectedLine}
                  eraEvents={eraEvents}
                  allMembers={members}
                  branchLabelMap={branchLabelMap}
                  onSelect={setSelected}
                />
              );
            })}
          </div>
        </div>
      )}

      {selected && (
        <MemberDetail member={selected} onClose={() => setSelected(null)} members={members} />
      )}
    </div>
  );
}
