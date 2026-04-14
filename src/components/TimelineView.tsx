import { useState } from "react";
import { type FamilyMember } from "@/data/familyData";
import { useFamilyMembers } from "@/hooks/useFamilyMembers";
import { historicalEvents, categoryStyles, type HistoricalEvent } from "@/data/historicalEvents";
import PersonCard from "./PersonCard";
import MemberDetail from "./MemberDetail";


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
    <div className="relative flex items-start gap-4 md:flex-row">
      <div className="absolute left-5 top-3 z-10 h-3 w-3 -translate-x-1/2 rotate-45 border-2 border-primary/60 bg-accent md:left-1/2" />
      <div className="ml-10 w-full md:mx-auto md:ml-0 md:max-w-lg">
        <div className="rounded-lg border border-dashed border-primary/30 bg-accent/50 px-4 py-3">
          <div className="flex items-start gap-2">
            <span className="text-base mt-0.5">{style.emoji}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-accent-foreground">
                {event.name}
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  {event.year}
                  {event.endYear && event.endYear !== event.year ? `–${event.endYear}` : ""}
                </span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
              {alive > 0 && (
                <p className="mt-1.5 text-xs font-medium text-primary/80">
                  {alive} family {alive === 1 ? "member" : "members"} alive during this event
                </p>
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
  onSelect,
}: {
  era: { label: string; range: [number, number]; members: FamilyMember[] };
  items: ({ type: "member"; member: FamilyMember; year: number } | { type: "event"; event: HistoricalEvent; year: number })[];
  selectedLine: string | null;
  eraEvents: HistoricalEvent[];
  allMembers: FamilyMember[];
  onSelect: (m: FamilyMember) => void;
}) {
  return (
    <div className="relative">
      {/* Era header */}
      <div className="sticky top-20 z-10 mb-6 flex md:justify-center">
        <span className="inline-flex items-center rounded-full bg-accent px-4 py-1.5 font-display text-lg font-medium text-accent-foreground shadow-sm">
          {era.label}
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({era.members.length} {era.members.length === 1 ? "person" : "people"}
            {!selectedLine && eraEvents.length > 0 ? `, ${eraEvents.length} events` : ""})
          </span>
        </span>
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
                <PersonCard member={item.member} onClick={() => onSelect(item.member)} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-sm font-medium transition-colors whitespace-nowrap ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent"
      }`}
    >
      {label}
    </button>
  );
}

export default function TimelineView() {
  const { members, eras, branches, isLoading } = useFamilyMembers();
  const [selected, setSelected] = useState<FamilyMember | null>(null);
  const [selectedEra, setSelectedEra] = useState<string | null>(null);
  const [selectedLine, setSelectedLine] = useState<string | null>(null);

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

  return (
    <div>
      {/* Filter bar */}
      <div className="mb-8 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-16 shrink-0">Era</span>
          <FilterPill label="All" active={!selectedEra} onClick={() => setSelectedEra(null)} />
          {eras.map((era) => (
            <FilterPill
              key={era.label}
              label={era.label}
              active={selectedEra === era.label}
              onClick={() => setSelectedEra(selectedEra === era.label ? null : era.label)}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-16 shrink-0">Line</span>
          <FilterPill label="All" active={!selectedLine} onClick={() => setSelectedLine(null)} />
          {branches.map((branch) => (
            <FilterPill
              key={branch.pageId}
              label={branch.label}
              active={selectedLine === branch.pageId}
              onClick={() => setSelectedLine(selectedLine === branch.pageId ? null : branch.pageId)}
            />
          ))}
        </div>
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

      {visibleEras.length === 0 ? (
        <p className="text-center text-muted-foreground py-16">No members match the selected filters.</p>
      ) : (
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border md:left-1/2 md:-translate-x-px" />
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
                  onSelect={setSelected}
                />
              );
            })}
          </div>
        </div>
      )}

      {selected && <MemberDetail member={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
