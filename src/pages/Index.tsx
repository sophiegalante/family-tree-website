import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import TimelineView from "@/components/TimelineView";
import MapView from "@/components/MapView";

type View = "timeline" | "map";

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState<View>((searchParams.get("view") as View) || "timeline");

  useEffect(() => {
    const v = searchParams.get("view") as View;
    if (v && v !== view) setView(v);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {view === "timeline" ? <TimelineView /> : <MapView />}
      </main>
    </div>
  );
};

export default Index;
