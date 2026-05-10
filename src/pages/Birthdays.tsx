import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Cake, ChevronLeft, ChevronRight, ArrowRight, X } from "lucide-react";
import { useFamilyMembers } from "@/hooks/useFamilyMembers";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const monthNamesMap: Record<string, number> = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
};

function parseDayMonth(dateStr: string): { day: number; month: number } | null {
  const m = dateStr.match(/^(\d{1,2})\s+(\w+)\s+(\d{4})$/i);
  if (!m) return null;
  const month = monthNamesMap[m[2].toLowerCase()];
  if (month === undefined) return null;
  return { day: parseInt(m[1]), month };
}

function nextBirthdayAge(day: number, month: number, birthYear: number): number {
  const today = new Date();
  const todayNorm = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const next = new Date(today.getFullYear(), month, day);
  if (next < todayNorm) next.setFullYear(today.getFullYear() + 1);
  return next.getFullYear() - birthYear;
}

const CURRENT_YEAR = new Date().getFullYear();
const OLDEST_LIVING_BIRTH_YEAR = CURRENT_YEAR - 120;

type BirthdayEntry = {
  memberId: string;
  name: string;
  birthDate: string;
  birthYear: number;
  day: number;
  month: number;
};

const Birthdays = () => {
  const { members, isLoading } = useFamilyMembers();
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [selected, setSelected] = useState<BirthdayEntry | null>(null);

  const birthdayMap = useMemo(() => {
    const map = new Map<string, BirthdayEntry[]>();
    for (const m of members) {
      if (m.deathDate) continue;
      if (!m.birthYear || m.birthYear < OLDEST_LIVING_BIRTH_YEAR) continue;
      if (!m.birthDate) continue;
      const parsed = parseDayMonth(m.birthDate);
      if (!parsed) continue;
      const { day, month } = parsed;
      const key = `${month}-${day}`;
      const entry: BirthdayEntry = {
        memberId: m.id,
        name: m.commonName,
        birthDate: m.birthDate,
        birthYear: m.birthYear,
        day,
        month,
      };
      map.set(key, [...(map.get(key) ?? []), entry]);
    }
    return map;
  }, [members]);

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
  const startOffset = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ...Array(totalCells - startOffset - daysInMonth).fill(null),
  ];

  function prevMonth() {
    setSelected(null);
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    setSelected(null);
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  const isToday = (day: number) =>
    day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">

          {/* Header */}
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Cake className="h-4.5 w-4.5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Birthdays</h1>
              <p className="text-sm text-muted-foreground">Living family members</p>
            </div>
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <div className="flex gap-4 items-start">
              {/* Calendar */}
              <div className="flex-1 rounded-xl border border-border bg-card overflow-hidden min-w-0">
                {/* Month navigation */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <button
                    onClick={prevMonth}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <p className="text-sm font-semibold text-foreground">
                    {MONTH_NAMES[viewMonth]} {viewYear}
                  </p>
                  <button
                    onClick={nextMonth}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    aria-label="Next month"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Day-of-week headers */}
                <div className="grid grid-cols-7 border-b border-border">
                  {DAY_LABELS.map((d) => (
                    <div key={d} className="py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 divide-x divide-y divide-border">
                  {cells.map((day, i) => {
                    const entries = day ? (birthdayMap.get(`${viewMonth}-${day}`) ?? []) : [];
                    const hasBirthday = entries.length > 0;
                    return (
                      <div
                        key={i}
                        className={`min-h-[80px] p-1.5 ${!day ? "bg-secondary/30" : ""}`}
                      >
                        {day && (
                          <>
                            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium mb-1
                              ${isToday(day)
                                ? "bg-primary text-primary-foreground"
                                : hasBirthday
                                ? "text-foreground"
                                : "text-muted-foreground"
                              }`}
                            >
                              {day}
                            </span>
                            <div className="space-y-0.5">
                              {entries.map((e) => (
                                <button
                                  key={e.memberId}
                                  onClick={() => setSelected(prev => prev?.memberId === e.memberId ? null : e)}
                                  className={`flex w-full items-start gap-1 rounded px-1 py-0.5 text-[11px] leading-tight transition-colors text-left
                                    ${selected?.memberId === e.memberId
                                      ? "bg-primary/15 text-primary font-semibold"
                                      : "text-primary hover:bg-primary/10"
                                    }`}
                                >
                                  <Cake className="h-2.5 w-2.5 mt-0.5 shrink-0" />
                                  <span className="truncate">{e.name} ({e.birthYear})</span>
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Detail card */}
              {selected && (
                <div className="w-56 shrink-0 rounded-xl border border-border bg-card p-5 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                      <Cake className="h-4 w-4" />
                    </div>
                    <button
                      onClick={() => setSelected(null)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div>
                    <p className="font-semibold text-foreground leading-snug">{selected.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{selected.birthDate}</p>
                  </div>

                  <div className="rounded-lg bg-accent/60 px-3 py-2 text-center">
                    <p className="text-xl font-bold text-foreground">
                      {nextBirthdayAge(selected.day, selected.month, selected.birthYear)}
                    </p>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Age</p>
                  </div>

                  <Link
                    to={`/member/${selected.memberId}`}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:border-primary/40 hover:bg-accent/30 transition-colors"
                  >
                    View full profile
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Birthdays;
