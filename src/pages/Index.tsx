import { useState } from "react";
import { Link } from "react-router-dom";
import { GitBranch, Clock, MapPin, Users, Home } from "lucide-react";
import TreeView from "@/components/TreeView";
import TimelineView from "@/components/TimelineView";
import MapView from "@/components/MapView";
import { useFamilyMembers } from "@/hooks/useFamilyMembers";

type View = "tree" | "timeline" | "map";

const Index = () => {
  const [view, setView] = useState<View>("tree");
  const { members, isLoading } = useFamilyMembers();

  const totalMembers = members.length;
  const earliest = members.length ? Math.min(...members.map((m) => m.birthYear)) : 0;
  const latest = members.length ? Math.max(...members.map((m) => m.birthYear)) : 0;
  const uniqueSurnames = [...new Set(members.map((m) => m.lastName))];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:text-foreground hover:border-primary/30">
              <Home className="h-4 w-4" />
            </Link>
            <div>
            <h1 className="font-display text-2xl text-foreground sm:text-3xl">
              Family Heritage
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {isLoading ? "…" : totalMembers} members
              </span>
              <span>·</span>
              <span>{isLoading ? "…" : `${earliest} – ${latest}`}</span>
              <span>·</span>
              <span>{isLoading ? "…" : uniqueSurnames.length} surnames</span>
            </div>
          </div>
          </div>

          {/* View toggle */}
          <div className="flex rounded-lg border border-border bg-secondary p-1">
            <button
              onClick={() => setView("tree")}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                view === "tree"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <GitBranch className="h-4 w-4" />
              Tree
            </button>
            <button
              onClick={() => setView("timeline")}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                view === "timeline"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Clock className="h-4 w-4" />
              Timeline
            </button>
            <button
              onClick={() => setView("map")}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                view === "map"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MapPin className="h-4 w-4" />
              Map
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {view === "tree" ? <TreeView /> : view === "timeline" ? <TimelineView /> : <MapView />}
      </main>
    </div>
  );
};

export default Index;
