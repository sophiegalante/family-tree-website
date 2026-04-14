import React from "react";
import { Link } from "react-router-dom";
import { GitBranch, Clock, MapPin, BookOpen, Heart, Feather, ArrowRight, ChevronDown, Users, Calendar, Church } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useFamilyMembers } from "@/hooks/useFamilyMembers";
import { useGitHubUpdates } from "@/hooks/useGitHubUpdates";
import { getBirthYearRange } from "@/lib/memberStats";

const Home = () => {
  const { members, isLoading } = useFamilyMembers();
  const { data: githubUpdates, isLoading: updatesLoading } = useGitHubUpdates();

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
              Tracing our roots from 12th-century Durham through centuries of farming,
              faith, and adventure — across England and beyond.
            </p>
            <div className="mt-10 inline-flex items-center gap-6 sm:gap-10 rounded-full border border-border bg-card/60 px-8 py-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Family Statistics</span>
              </div>
              <span className="h-4 w-px bg-border" />
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
                  {i < arr.length - 1 && <span className="h-4 w-px bg-border" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Explore CTAs */}
      <section className="container mx-auto px-4 -mt-6 relative z-10">
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Tree — coming soon */}
          <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card/50 p-6 text-center opacity-60 cursor-default">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <GitBranch className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Explore the Tree</p>
              <p className="mt-1 text-sm text-muted-foreground">Navigate branches, discover connections</p>
            </div>
            <span className="mt-1 text-xs font-medium text-muted-foreground">Coming soon!</span>
          </div>

          {[
            { icon: Clock, label: "Walk the Timeline", desc: "Follow centuries of family history", to: "/explore?view=timeline" },
            { icon: MapPin, label: "View the Map", desc: "Trace locations across England & beyond", to: "/explore?view=map" },
          ].map(({ icon: Icon, label, desc, to }) => (
            <Link
              key={label}
              to={to}
              className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 text-center shadow-sm transition-all hover:shadow-lg hover:border-primary/40 hover:-translate-y-0.5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
              </div>
              <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                Go <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          ))}
        </div>
      </section>

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
              <p>
                P. H. Reaney's <em>Dictionary of British Surnames</em> traces the Durham branch to a
                personal name — a diminutive of Old English <em>Aeddi</em> (as found in Bede) with an
                inorganic H. The earliest records reach back to 1187 in Northumberland and 1209 in the
                Rotuli Chartarum, spanning Suffolk, Lancashire, Durham, and Yorkshire.
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

            <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
              <p className="mb-6 text-muted-foreground leading-relaxed">
                This project is dedicated to the memory of <strong className="text-foreground">Arthur Haddock</strong>,
                whose lifelong passion for family history made all of this possible. Arthur traced
                records across the globe — from the parish churches and county archives of Durham,
                Yorkshire, Lancashire, and Suffolk, to the furthest reaches of Australia and beyond.
                He corresponded with distant relatives on multiple continents, meticulously piecing
                together centuries of births, marriages, and migrations. His extraordinary devotion
                to preserving our family's story is the foundation upon which this digital heritage
                is built.
              </p>

              <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
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
