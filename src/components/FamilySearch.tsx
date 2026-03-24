import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, User, MapPin } from "lucide-react";
import { type FamilyMember } from "@/data/familyData";
import { useFamilyMembers } from "@/hooks/useFamilyMembers";

const FamilySearch = () => {
  const { members } = useFamilyMembers();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<FamilyMember[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const q = query.toLowerCase();
    setResults(
      members.filter(
        (m) =>
          m.commonName.toLowerCase().includes(q) ||
          m.firstName.toLowerCase().includes(q) ||
          m.lastName.toLowerCase().includes(q) ||
          m.birthPlace?.toLowerCase().includes(q) ||
          m.spouseName?.toLowerCase().includes(q)
      ).slice(0, 8)
    );
  }, [query, members]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (member: FamilyMember) => {
    setQuery("");
    setOpen(false);
    navigate(`/member/${member.id}`);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2 rounded-md border border-border bg-secondary/50 px-3 py-1.5 transition-colors focus-within:border-primary/50 focus-within:bg-card">
        <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search family members…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => query && setOpen(true)}
          className="w-28 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none sm:w-44"
        />
        {query && (
          <button onClick={() => { setQuery(""); setResults([]); }} className="text-muted-foreground hover:text-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-lg border border-border bg-card shadow-lg sm:w-80 z-50">
          <div className="p-1.5">
            <p className="px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {results.length} result{results.length !== 1 ? "s" : ""}
            </p>
            {results.map((member) => (
              <button
                key={member.id}
                onClick={() => handleSelect(member)}
                className="flex w-full items-start gap-3 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-accent"
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {member.commonName}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{member.birthYear}{member.deathYear ? `–${member.deathYear}` : ""}</span>
                    {member.birthPlace && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-0.5 truncate">
                          <MapPin className="h-2.5 w-2.5" />
                          {member.birthPlace}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {open && query && results.length === 0 && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-lg border border-border bg-card p-4 shadow-lg sm:w-80 z-50">
          <p className="text-center text-sm text-muted-foreground">No members found for "{query}"</p>
        </div>
      )}
    </div>
  );
};

export default FamilySearch;
