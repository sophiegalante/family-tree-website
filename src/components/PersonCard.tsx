import type { FamilyMember } from "@/data/familyData";
import { User, Heart, MapPin } from "lucide-react";

interface PersonCardProps {
  member: FamilyMember;
  isSelected?: boolean;
  onClick?: () => void;
  compact?: boolean;
  branchColors?: string[];
  branchLabels?: string[];
}

export default function PersonCard({ member, isSelected, onClick, compact, branchColors, branchLabels }: PersonCardProps) {
  const lifespan = member.deathYear
    ? `${member.birthYear} – ${member.deathYear}`
    : `b. ${member.birthYear}`;

  if (compact) {
    return (
      <button
        onClick={onClick}
        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-all hover:shadow-md ${
          isSelected
            ? "border-primary bg-accent shadow-md"
            : "border-border bg-card hover:border-primary/40"
        }`}
      >
        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
          member.gender === "male" ? "bg-primary/10 text-primary" : "bg-pink-100 text-pink-600"
        }`}>
          <User className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium text-card-foreground">
            {member.firstName} {member.lastName}
          </p>
          <p className="text-xs text-muted-foreground">{lifespan}</p>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`group w-full rounded-xl border p-4 text-left transition-all hover:shadow-lg ${
        isSelected
          ? "border-primary bg-accent shadow-lg"
          : "border-border bg-card hover:border-primary/40"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
          member.gender === "male" ? "bg-primary/10 text-primary" : "bg-pink-100 text-pink-600"
        }`}>
          <User className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="flex items-center gap-1.5 font-semibold text-card-foreground">
            {branchColors && branchColors.length > 0 && (
              <span className="flex items-center gap-0.5">
                {branchColors.map((color, i) => (
                  <span
                    key={i}
                    className="inline-block h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </span>
            )}
            {member.firstName}{member.middleName ? ` ${member.middleName}` : ""} {member.lastName}
          </h3>
          <p className="text-sm text-muted-foreground">{lifespan}</p>
          {member.birthPlace && (
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {member.birthPlace}
            </p>
          )}
          {branchLabels && branchLabels.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {branchLabels.map((label, i) => (
                <span
                  key={label}
                  className="inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold"
                  style={{
                    backgroundColor: branchColors?.[i] ? `${branchColors[i]}18` : undefined,
                    color: branchColors?.[i] ?? undefined,
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      {member.spouseName && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-secondary/60 px-3 py-2">
          <Heart className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            m. {member.spouseName}
          </span>
        </div>
      )}
    </button>
  );
}
