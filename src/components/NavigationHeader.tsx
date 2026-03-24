import { Link } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { GitBranch, Home, Feather, Menu, X, Clock, MapPin, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import FamilySearch from "@/components/FamilySearch";

const exploreItems = [
  { label: "Tree", to: "/explore?view=tree", icon: GitBranch },
  { label: "Timeline", to: "/explore?view=timeline", icon: Clock },
  { label: "Map", to: "/explore?view=map", icon: MapPin },
];

const navItems = [
  { label: "Origin of the Name", to: "/origin", icon: Feather },
];

const NavigationHeader = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const exploreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exploreRef.current && !exploreRef.current.contains(e.target as Node)) {
        setExploreOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
          <GitBranch className="h-5 w-5 text-primary" />
          <span className="hidden sm:inline">The Haddock Family</span>
          <span className="sm:hidden">Haddock</span>
        </Link>

        <div className="hidden items-center gap-4 md:flex">
          <nav className="flex items-center gap-1">
            <NavLink
              to="/"
              end
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-accent"
              activeClassName="text-foreground bg-accent"
            >
              Home
            </NavLink>

            {/* Explore dropdown */}
            <div ref={exploreRef} className="relative">
              <button
                onClick={() => setExploreOpen(!exploreOpen)}
                className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-accent"
              >
                Explore
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${exploreOpen ? "rotate-180" : ""}`} />
              </button>
              {exploreOpen && (
                <div className="absolute left-0 top-full mt-1 w-40 rounded-lg border border-border bg-card shadow-lg">
                  {exploreItems.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setExploreOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-accent first:rounded-t-lg last:rounded-b-lg"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-accent"
                activeClassName="text-foreground bg-accent"
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <FamilySearch />
        </div>

        {/* Mobile toggle */}
        <button
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="border-t border-border bg-background px-4 pb-4 pt-2 md:hidden space-y-1">
          <div className="py-2">
            <FamilySearch />
          </div>
          <NavLink
            to="/"
            end
            className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-accent"
            activeClassName="text-foreground bg-accent"
            onClick={() => setMobileOpen(false)}
          >
            <Home className="h-4 w-4" />
            Home
          </NavLink>
          <p className="px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Explore</p>
          {exploreItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-accent"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-accent"
              activeClassName="text-foreground bg-accent"
              onClick={() => setMobileOpen(false)}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
};

export default NavigationHeader;
