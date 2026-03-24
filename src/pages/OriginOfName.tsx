import { Link } from "react-router-dom";
import { ArrowLeft, Feather } from "lucide-react";

const OriginOfName = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center gap-4 px-4 py-4">
          <Link
            to="/"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:text-foreground hover:border-primary/30"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-3">
            <Feather className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">Origin of the Haddock Name</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <article className="mx-auto max-w-3xl space-y-6 text-muted-foreground leading-relaxed">
          <p>
            Before starting out on any analysis of the various families of Haddock it is as well to
            clarify as far as possible two general questions. How did the name arise and where did
            the family originate? In fact the answers to both questions are intertwined as it will
            be found that the origin of the name and the location go hand in hand.
          </p>
          <p>
            In younger life many members of the family must have questioned how the name arose and
            perhaps even why no-one attempted to change it. In fact several minor changes occurred
            over the years but in general the <em>Haddock</em> name has remained predominantly the
            same. In later life the merits of such a name become more apparent as people remember
            it. This can be a great advantage and indeed organizations today spend many millions
            trying to get the public to remember names.
          </p>
          <p>
            No-one will be surprised to hear of the almost universal association of the name
            Haddock with fish. In all its variations it brings forth attempted witticisms from all
            quarters, rarely complimentary. When George Haddock (1823–1907) purchased the Emperor
            Stradivarius violin, <em>Punch</em> remarked that a mistake must have been made in the
            style of instrument purchased. Instead of a "Violin Strad" it thought that the "Harp
            of Erin" (herring) would have been more appropriate to Mr. Haddock. A nickname from
            the fish first recorded in 1307 is a definite possibility for the origin of the name,
            especially in Suffolk for a seller of haddocks.
          </p>
          <p>
            Many of the Haddocks however have a farming background where not too long ago
            <em> haddock</em> had a very different meaning. In his diary entry for August 19 1809,
            Joseph Rogerson states{" "}
            <em>
              "The stormiest night for wind and rain I have seen this long time; it has scarce left
              a haddock standing in the fields……"
            </em>
            . A haddock (or hattock) in this connection was a stook, a shock of corn consisting of
            a number of sheaves set to dry.
          </p>

          <h2 className="pt-4 text-xl font-semibold text-foreground">Earliest Records</h2>

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
                <tr><td className="px-4 py-2.5">1209</td><td className="px-4 py-2.5">William Haddoc</td><td className="px-4 py-2.5">Rotuli Chartarum 1837</td></tr>
                <tr><td className="px-4 py-2.5">1228</td><td className="px-4 py-2.5">William Haddoc</td><td className="px-4 py-2.5">Feodarium Prioratus Dunelmensis</td></tr>
                <tr><td className="px-4 py-2.5">1302</td><td className="px-4 py-2.5">John Haddock</td><td className="px-4 py-2.5">Subsidy Rolls, Yorkshire</td></tr>
                <tr><td className="px-4 py-2.5">1187</td><td className="px-4 py-2.5">Addoch de Eselinton</td><td className="px-4 py-2.5">Pipe Rolls, Northumberland</td></tr>
                <tr><td className="px-4 py-2.5">1220</td><td className="px-4 py-2.5">Addoch</td><td className="px-4 py-2.5">Feodarium Prioratus Dunelmensis</td></tr>
                <tr><td className="px-4 py-2.5">1243</td><td className="px-4 py-2.5">William Addoch</td><td className="px-4 py-2.5">Assize Rolls, Durham</td></tr>
              </tbody>
            </table>
          </div>

          <h2 className="pt-4 text-xl font-semibold text-foreground">The Durham Connection</h2>

          <p>
            P. H. Reaney's <em>Dictionary of British Surnames</em> notes that Haddock is a local
            pronunciation of Haydock, especially in Lancashire — but this would not account for the
            earlier Durham forms. More importantly, the dictionary states that the Durham name is
            probably a personal name, a diminutive of Old English <em>Aeddi</em> (as found in
            Bede) with an inorganic H.
          </p>
          <p>
            The Venerable Bede (673–735) was an English monk and historian who spent most of his
            life at the monasteries of Monkwearmouth and Jarrow in Durham. The Pipe Rolls,
            introduced in 1110, were Exchequer records of account of sheriffs and other royal
            officials in all counties. They remained in force until 1834 and are the longest
            series of English public records.
          </p>

          <h2 className="pt-4 text-xl font-semibold text-foreground">Geographic Spread</h2>

          <p>
            During the course of the study, it has been possible to identify all three family
            groups. The Haddock families in Leeds for example had four different geographical
            origins — Suffolk, Lancashire, Durham, as well as those already in Yorkshire at the
            end of the sixteenth century. There are many records of the Haddock name which reach
            back into the twelfth and thirteenth centuries but as yet no direct link has been
            established between these and the family under study. The search continues.
          </p>
        </article>
      </main>
    </div>
  );
};

export default OriginOfName;
