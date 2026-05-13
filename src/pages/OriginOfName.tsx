import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Fish, Wheat, BookOpen, MapPin, Calendar, GitBranch, Clock, ChevronRight, Compass } from "lucide-react";

const evoNodes = [
  { name: "Aeddi",   century: "8th century · Old English" },
  { name: "Addoch",  century: "1187 · Pipe Rolls" },
  { name: "Haddoc",  century: "1209 · Rotuli Chartarum" },
  { name: "Haddock", century: "1302 · Yorkshire Subsidy Rolls" },
];

const records = [
  { year: 1187, name: "Addoch de Eselinton", source: "Pipe Rolls, Northumberland" },
  { year: 1209, name: "William Haddoc",      source: "Rotuli Chartarum 1837" },
  { year: 1220, name: "Addoch",              source: "Feodarium Prioratus Dunelmensis" },
  { year: 1228, name: "William Haddoc",      source: "Feodarium Prioratus Dunelmensis" },
  { year: 1243, name: "William Addoch",      source: "Assize Rolls, Durham" },
  { year: 1302, name: "John Haddock",        source: "Subsidy Rolls, Yorkshire" },
];

const locations = ["Durham", "Yorkshire", "Lancashire", "Suffolk"];

const OriginOfName = () => {
  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-border bg-secondary/50">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="container mx-auto px-4 pt-5">
          <Link
            to="/"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
        <div className="container mx-auto px-4 pb-16 pt-8 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
            Surname etymology
          </p>
          <h1 className="font-display text-4xl font-bold text-foreground sm:text-5xl">
            Origin of the Haddock Name
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            A name rooted in Durham, traced from 1187 to the present day
          </p>
          <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-3 rounded-full border border-border bg-card/60 px-6 py-3 text-sm">
            <span className="font-semibold text-foreground">First recorded</span>
            <span className="h-1.5 w-1.5 rounded-full bg-border" />
            <span className="font-semibold text-foreground">1187</span>
            <span className="h-1.5 w-1.5 rounded-full bg-border" />
            <span className="text-muted-foreground">Old English origin</span>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl space-y-16">

          {/* ── Name evolution strip ── */}
          <section>
            <div className="flex flex-col rounded-xl border border-border bg-card px-6 py-7 sm:flex-row sm:items-center sm:justify-center">
              {evoNodes.map((node, i) => (
                <React.Fragment key={node.name}>
                  <div className="flex items-center gap-3 py-1 sm:flex-col sm:gap-0 sm:px-5 sm:py-0 sm:text-center">
                    <span className="font-serif text-lg font-bold text-foreground sm:text-xl">
                      {node.name}
                    </span>
                    <span className="text-[11px] text-muted-foreground sm:mt-1.5">
                      {node.century}
                    </span>
                  </div>
                  {i < evoNodes.length - 1 && (
                    <ChevronRight className="mx-auto my-0.5 h-5 w-5 flex-shrink-0 rotate-90 text-muted-foreground/25 sm:mx-0 sm:my-0 sm:rotate-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </section>

          {/* ── Three origin theories ── */}
          <section>
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <BookOpen className="h-4 w-4" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground">How Did the Name Arise?</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

              {/* Fish */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                  <Fish className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">A Fishmonger's Name</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  A nickname from the fish, first recorded in 1307 — especially in Suffolk, for a
                  seller of haddocks. When George Haddock (1823–1907) purchased the Emperor
                  Stradivarius violin, <em>Punch</em> remarked that the "Harp of Erin" (herring)
                  would have been more appropriate.
                </p>
              </div>

              {/* Farming */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                  <Wheat className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">A Farmer's Harvest</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  In farming communities, a <em>haddock</em> (or hattock) was a stook — a shock of
                  corn sheaves set upright to dry.
                </p>
                <blockquote className="mt-3 border-l-2 border-border pl-3 text-xs italic leading-relaxed text-muted-foreground">
                  "The stormiest night for wind and rain I have seen this long time; it has scarce
                  left a haddock standing in the fields…"
                  <cite className="mt-1.5 block not-italic font-medium text-muted-foreground/60">
                    — Joseph Rogerson, 19 Aug 1809
                  </cite>
                </blockquote>
              </div>

              {/* Old English */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">An Old English Name</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  P. H. Reaney's <em>Dictionary of British Surnames</em> links the Durham form to a
                  personal name — a diminutive of Old English <em>Aeddi</em> (as found in Bede)
                  with an inorganic H. The Venerable Bede (673–735) spent his life at monasteries
                  in Durham, making this the most geographically compelling theory.
                </p>
              </div>

            </div>
          </section>

          {/* ── Earliest Records ── */}
          <section>
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Calendar className="h-4 w-4" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground">Earliest Records</h2>
            </div>
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted">
                    <th className="px-4 py-3 text-left font-medium text-foreground">Year</th>
                    <th className="px-4 py-3 text-left font-medium text-foreground">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-foreground">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {records.map((r) => (
                    <tr key={`${r.year}-${r.name}`}>
                      <td className="px-4 py-2.5">
                        <span className="inline-block rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                          {r.year}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-foreground">{r.name}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{r.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── The Durham Connection ── */}
          <section>
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <MapPin className="h-4 w-4" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground">The Durham Connection</h2>
            </div>
            <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                P. H. Reaney's <em>Dictionary of British Surnames</em> notes that Haddock is a
                local pronunciation of Haydock, especially in Lancashire — but this would not
                account for the earlier Durham forms.
              </p>
              <blockquote className="rounded-r-lg border-l-[3px] border-primary/30 bg-accent/40 py-3 pl-5 pr-4 text-sm italic leading-relaxed text-foreground/80">
                The Durham name is probably a personal name, a diminutive of Old English{" "}
                <em>Aeddi</em> (as found in Bede) with an inorganic H.
                <cite className="mt-2 block not-italic text-xs font-semibold text-muted-foreground">
                  — P. H. Reaney, Dictionary of British Surnames
                </cite>
              </blockquote>
              <p>
                The Venerable Bede (673–735) was an English monk and historian who spent most of
                his life at the monasteries of Monkwearmouth and Jarrow in Durham. The Pipe Rolls,
                introduced in 1110, were Exchequer records of account of sheriffs and other royal
                officials in all counties. They remained in force until 1834 and are the longest
                series of English public records.
              </p>
            </div>
          </section>

          {/* ── Geographic Spread ── */}
          <section>
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Compass className="h-4 w-4" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground">Geographic Spread</h2>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              During the course of the study, it has been possible to identify all three family
              groups. The Haddock families in Leeds, for example, had four different geographical
              origins — Suffolk, Lancashire, Durham, as well as those already in Yorkshire at the
              end of the sixteenth century. There are many records of the Haddock name which reach
              back into the twelfth and thirteenth centuries but as yet no direct link has been
              established between these and the family under study. The search continues.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {locations.map((loc) => (
                <span
                  key={loc}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground"
                >
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  {loc}
                </span>
              ))}
            </div>
          </section>

        </div>
      </main>

      {/* ── Footer CTA ── */}
      <footer className="border-t border-border bg-secondary/30 py-10">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <p className="mb-5 text-sm font-medium text-muted-foreground">
              Continue exploring the family
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

              {/* Tree — soon */}
              <div className="flex cursor-default items-center gap-4 rounded-xl border border-dashed border-border bg-card p-5 opacity-50">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <GitBranch className="h-5 w-5 text-primary/50" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">Explore the Tree</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Navigate branches &amp; connections</p>
                </div>
                <span className="ml-auto shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                  Soon
                </span>
              </div>

              {/* Timeline */}
              <Link
                to="/explore?view=timeline"
                className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary">
                  <Clock className="h-5 w-5 text-primary transition-colors group-hover:text-primary-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">Walk the Timeline</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Follow centuries of family history</p>
                </div>
                <ChevronRight className="ml-auto h-4 w-4 flex-shrink-0 text-muted-foreground/40 transition-colors group-hover:text-primary" />
              </Link>

              {/* Map */}
              <Link
                to="/explore?view=map"
                className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary">
                  <MapPin className="h-5 w-5 text-primary transition-colors group-hover:text-primary-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">View the Map</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Trace locations across England &amp; beyond</p>
                </div>
                <ChevronRight className="ml-auto h-4 w-4 flex-shrink-0 text-muted-foreground/40 transition-colors group-hover:text-primary" />
              </Link>

            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default OriginOfName;
