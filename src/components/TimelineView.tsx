import { useState } from "react";
import { type FamilyMember } from "@/data/familyData";
import { useFamilyMembers } from "@/hooks/useFamilyMembers";
import { historicalEvents, categoryStyles, type HistoricalEvent } from "@/data/historicalEvents";
import PersonCard from "./PersonCard";
import MemberDetail from "./MemberDetail";

function TimelineEvent({ event }: { event: HistoricalEvent }) {
  const style = categoryStyles[event.category];
  return (
    <div className="relative flex items-start gap-4 md:flex-row">
      {/* Diamond on timeline */}
      <div className="absolute left-5 top-3 z-10 h-3 w-3 -translate-x-1/2 rotate-45 border-2 border-primary/60 bg-accent md:left-1/2" />

      <div className="ml-10 w-full md:mx-auto md:ml-0 md:max-w-lg">
        <div className="rounded-lg border border-dashed border-primary/30 bg-accent/50 px-4 py-3">
          <div className="flex items-start gap-2">
            <span className="text-base mt-0.5">{style.emoji}</span>
            <div>
              <p className="text-sm font-semibold text-accent-foreground">
                {event.name}
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  {event.year}{event.endYear && event.endYear !== event.year ? `–${event.endYear}` : ""}
                </span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TimelineView() {
  const { eras, isLoading } = useFamilyMembers();
  const [selected, setSelected] = useState<FamilyMember | null>(null);

  if (isLoading) {
    return <div className="p-4 text-muted-foreground">Loading timeline…</div>;
  }

  return (
    <div className="relative">
      {/* Timeline track */}
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border md:left-1/2 md:-translate-x-px" />

      <div className="space-y-12">
        {eras.map((era) => {
          // Find historical events that fall within this era
          const eraEvents = historicalEvents.filter((ev) => {
            const eventStart = ev.year;
            return eventStart >= era.range[0] && eventStart <= era.range[1];
          });

          // Merge members and events by year for chronological display
          type TimelineItem =
            | { type: "member"; member: FamilyMember; year: number }
            | { type: "event"; event: HistoricalEvent; year: number };

          const items: TimelineItem[] = [
            ...era.members.map((m) => ({ type: "member" as const, member: m, year: m.birthYear })),
            ...eraEvents.map((e) => ({ type: "event" as const, event: e, year: e.year })),
          ].sort((a, b) => a.year - b.year);

          return (
            <div key={era.label} className="relative">
              {/* Era badge */}
              <div className="sticky top-20 z-10 mb-6 flex md:justify-center">
                <span className="inline-flex items-center rounded-full bg-accent px-4 py-1.5 font-display text-lg font-medium text-accent-foreground shadow-sm">
                  {era.label}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({era.members.length} people{eraEvents.length > 0 ? `, ${eraEvents.length} events` : ""})
                  </span>
                </span>
              </div>

              {/* Items */}
              <div className="space-y-4">
                {items.map((item, idx) => {
                  if (item.type === "event") {
                    return <TimelineEvent key={`ev-${item.event.name}`} event={item.event} />;
                  }

                  const isLeft = idx % 2 === 0;
                  return (
                    <div
                      key={item.member.id}
                      className={`relative flex items-start gap-4 ${
                        isLeft ? "md:flex-row" : "md:flex-row-reverse"
                      }`}
                    >
                      {/* Dot */}
                      <div className="absolute left-5 top-4 z-10 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-primary bg-card md:left-1/2" />

                      {/* Card */}
                      <div className={`ml-10 w-full md:ml-0 md:w-[calc(50%-2rem)] ${
                        isLeft ? "md:mr-auto md:pr-8" : "md:ml-auto md:pl-8"
                      }`}>
                        <PersonCard
                          member={item.member}
                          onClick={() => setSelected(item.member)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <MemberDetail member={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
