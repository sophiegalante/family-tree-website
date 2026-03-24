import { Link } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { GitBranch, Home, Feather, Menu, X } from "lucide-react";
import { useState } from "react";
import FamilySearch from "@/components/FamilySearch";

const navItems = [
  { label: "Home", to: "/", icon: Home },
  { label: "Explore", to: "/explore", icon: GitBranch },
  { label: "Origin of the Name", to: "/origin", icon: Feather },
];

const NavigationHeader = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

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
