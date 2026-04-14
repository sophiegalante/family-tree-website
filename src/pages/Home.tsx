import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { GitBranch, Clock, MapPin, BookOpen, Heart, Feather, ArrowRight, ChevronDown, Users, Calendar, Church } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useFamilyMembers } from "@/hooks/useFamilyMembers";
import { useGitHubUpdates } from "@/hooks/useGitHubUpdates";
import { getBirthYearRange } from "@/lib/memberStats";

const Home = () => {
  const { members, isLoading } = useFamilyMembers();
  const { data: githubUpdates, isLoading: updatesLoading } = useGitHubUpdates();

  // "On this day" — events matching today's month and day
  const onThisDayEvents = useMemo(() => {
    const today = new Date();
    const todayMonth = today.getMonth(); // 0-indexed
    const todayDay = today.getDate();

    const monthNames: Record<string, number> = {
      january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
      july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
    };

    function parseDate(str: string | undefined): Date | null {
      if (!str) return null;
      const m = str.match(/^(\d{1,2})\s+(\w+)\s+(\d{4})$/i);
      if (m) {
        const month = monthNames[m[2].toLowerCase()];
        if (month !== undefined) return new Date(parseInt(m[3]), month, parseInt(m[1]));
      }
      const d = new Date(str);
      return isNaN(d.getTime()) ? null : d;
    }

    function matches(str: string | undefined) {
      const d = parseDate(str);
      return d && d.getMonth() === todayMonth && d.getDate() === todayDay;
    }

    type EventEntry = { memberId: string; name: string; type: string; year: number; detail: string; color: string };
    const events: EventEntry[] = [];

    for (const m of members) {
      const name = `${m.firstName} ${m.lastName}`;
      if (matches(m.birthDate)) {
        const year = parseDate(m.birthDate)!.getFullYear();
        events.push({ memberId: m.id, name, type: "Born", year, detail: m.birthPlace ?? "", color: "text-green-600 bg-green-50" });
      }
      if (matches(m.deathDate)) {
        const year = parseDate(m.deathDate)!.getFullYear();
        events.push({ memberId: m.id, name, type: "Died", year, detail: m.deathPlace ?? "", color: "text-slate-500 bg-slate-100" });
      }
      if (matches(m.marriageDate)) {
        const year = parseDate(m.marriageDate)!.getFullYear();
        events.push({ memberId: m.id, name, type: "Married", year, detail: m.spouseName ? `to ${m.spouseName}` : (m.marriagePlace ?? ""), color: "text-pink-600 bg-pink-50" });
      }
      if (matches(m.baptismDate)) {
        const year = parseDate(m.baptismDate)!.getFullYear();
        events.push({ memberId: m.id, name, type: "Baptised", year, detail: m.baptismPlace ?? "", color: "text-blue-600 bg-blue-50" });
      }
    }

    return events.sort((a, b) => a.year - b.year);
  }, [members]);

  const todayLabel = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long" });

  const totalMembers = members.length;
  const uniqueSurnames = [...new Set(members.map((m) => m.lastName))];
  const { earliest, latest } = getBirthYearRange(members);
  const uniquePlaces = [...new Set(members.map((m) => m.birthPlace).filter(Boolean))];
  const marriages = members.filter((m) => m.marriageDate).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-secondary/50">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
              A Family History
            </p>
            <h1 className="font-display text-4xl font-bold text-foreground sm:text-5xl lg:text-6xl">
              The Haddock Family
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
              Tracing our roots from 16th-century Durham through centuries of farming,
              faith, and adventure — across England and beyond.
            </p>
            <div className="mt-10 rounded-xl sm:rounded-full border border-border bg-card/60 px-6 py-4 sm:px-8 sm:inline-flex sm:items-center sm:gap-10">
              <div className="flex items-center gap-2 text-muted-foreground justify-center mb-3 sm:mb-0">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Family Statistics</span>
              </div>
              <span className="hidden sm:block h-4 w-px bg-border" />
              <div className="grid grid-cols-2 gap-4 sm:flex sm:items-center sm:gap-10">
                {[
                  { value: isLoading ? "…" : totalMembers, label: "Members" },
                  { value: isLoading ? "…" : `${earliest}–${latest}`, label: "Timespan" },
                  { value: isLoading ? "…" : uniquePlaces.length, label: "Locations" },
                  { value: isLoading ? "…" : marriages, label: "Marriages" },
                ].map(({ value, label }, i, arr) => (
                  <React.Fragment key={label}>
                    <div className="text-center">
                      <p className="whitespace-nowrap text-sm sm:text-base lg:text-lg font-bold text-foreground">{value}</p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
                    </div>
                    {i < arr.length - 1 && <span className="hidden sm:block h-4 w-px bg-border" />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore CTAs */}
      <section className="container mx-auto px-4 -mt-6 relative z-10">
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Tree — coming soon */}
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card p-6 text-center cursor-default">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary/40">
              <GitBranch className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground/50">Explore the Tree</p>
              <p className="mt-1 text-sm text-muted-foreground/50">Navigate branches, discover connections</p>
            </div>
            <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
              Coming soon
            </span>
          </div>

          {[
            { icon: Clock, label: "Walk the Timeline", desc: "Follow centuries of family history", to: "/explore?view=timeline" },
            { icon: MapPin, label: "View the Map", desc: "Trace locations across England & beyond", to: "/explore?view=map" },
          ].map(({ icon: Icon, label, desc, to }) => (
            <Link
              key={label}
              to={to}
              className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 text-center shadow-md transition-all hover:shadow-xl hover:border-primary/40 hover:-translate-y-1 cursor-pointer"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
              </div>
              <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary">
                Go <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* On this day */}
      {!isLoading && (
        <section className="border-t border-border py-8 mt-6">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Calendar className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-foreground">On this day…</h2>
                  <p className="text-sm text-muted-foreground">{todayLabel}</p>
                </div>
              </div>
              {onThisDayEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No recorded family events on this date.</p>
              ) : (
                <div className="space-y-3">
                  {onThisDayEvents.map((event, i) => (
                    <Link
                      key={i}
                      to={`/member/${event.memberId}`}
                      className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/30"
                    >
                      <span className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold ${event.color}`}>
                        {event.type}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{event.name}</p>
                        {event.detail && <p className="text-xs text-muted-foreground truncate">{event.detail}</p>}
                      </div>
                      <span className="ml-auto shrink-0 text-sm font-medium text-muted-foreground">{event.year}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Origin of the Haddock Name — Summary */}
      <section className="border-t border-border bg-secondary/30 py-8">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Feather className="h-4.5 w-4.5" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground">
                Origin of the Haddock Name
              </h2>
            </div>

            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                How did the name arise and where did the family originate? The answers are intertwined —
                the origin of the name and the location go hand in hand. The most familiar association
                is with the fish, first recorded in 1307, but in farming communities a <em>haddock</em> (or
                hattock) meant a stook of corn sheaves set to dry.
              </p>
              <Link
                to="/origin"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Read the full history
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tribute to Arthur Haddock */}
      <section className="border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Heart className="h-4.5 w-4.5" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground">
                In Memory of Arthur Haddock
              </h2>
            </div>

            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                This project is dedicated to the memory of <strong className="text-foreground">Arthur Haddock</strong>,
                whose lifelong passion for family history made all of this possible. Arthur traced
                records across the globe — from the parish churches and county archives of Durham,
                Yorkshire, Lancashire, and Suffolk, to the furthest reaches of Australia and beyond.
                He corresponded with distant relatives on multiple continents, meticulously piecing
                together centuries of births, marriages, and migrations. His extraordinary devotion
                to preserving our family's story is the foundation upon which this digital heritage
                is built.
              </p>

              <p className="text-sm text-muted-foreground leading-relaxed">
                His brother, Dr Ernest Haddock, wrote the following poem in 1991 as a tribute to
                Arthur's lifelong dedication to uncovering the family's past.
              </p>

              {/* Collapsible Poem */}
              <Collapsible>
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-border bg-secondary/50 px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
                  <span className="italic">"Searching" — Dr Ernest Haddock</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform [[data-state=open]>&]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-2 rounded-lg border border-border bg-secondary/50 p-6 sm:p-8">
                    <div className="space-y-6 text-center text-muted-foreground leading-relaxed italic">
                      <p>
                        Delve deep into time's grey swirling mist,<br />
                        To the day young lovers early kissed.<br />
                        Twas then down the road your kin folk came,<br />
                        Those who were to carry the family name.
                      </p>
                      <p>
                        Look back into the past to your forebears,<br />
                        Discover of their joys and of their cares.<br />
                        Find their old houses and tombstones,<br />
                        Where it was they laid their bones.
                      </p>
                      <p>
                        Learn of those who stayed, those who left,<br />
                        Those who were happy, those bereft.<br />
                        Those with children, those without,<br />
                        Those who saw Culloden's rout.
                      </p>
                      <p>
                        Uncover your relations in New York,<br />
                        Members of the Church in County Cork.<br />
                        Someone who fought at Nelson's side,<br />
                        In search of glory and for England died.
                      </p>
                      <p>
                        Of one thing, you can be sure,<br />
                        As you search, you'll then search more.<br />
                        This search you've started can only be,<br />
                        Truly finished by your Family Tree.
                      </p>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Updates */}
      <section className="border-t border-border container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <BookOpen className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground">Recent Updates</h2>
          </div>
          <div className="space-y-4">
            {updatesLoading && (
              <p className="text-sm text-muted-foreground">Loading updates…</p>
            )}
            {!updatesLoading && (!githubUpdates || githubUpdates.length === 0) && (
              <p className="text-sm text-muted-foreground">No updates found.</p>
            )}
            {githubUpdates?.map((update, i) => (
              <a
                key={i}
                href={update.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/30"
              >
                <span className="mt-0.5 shrink-0 rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
                  {update.date}
                </span>
                <p className="text-sm text-foreground">{update.text}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/30 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>The Haddock Family Heritage Project · Built with care to preserve our shared history</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
