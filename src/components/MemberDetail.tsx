import { useNavigate } from "react-router-dom";
import type { FamilyMember } from "@/data/familyData";
import { getEventsForPerson, categoryStyles } from "@/data/historicalEvents";
import { X, User, MapPin, Heart, Users, Church, Scroll, ExternalLink } from "lucide-react";

interface MemberDetailProps {
  member: FamilyMember;
  onClose: () => void;
}

export default function MemberDetail({ member, onClose }: MemberDetailProps) {
  const navigate = useNavigate();
  const lifespan = member.deathYear
    ? `${member.birthDate} – ${member.deathDate}`
    : `${member.birthDate} – present`;

  const events = getEventsForPerson(
    member.birthYear,
    member.deathYear,
    member.birthPlace,
    member.deathPlace,
    member.marriagePlace
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative mx-4 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-4">
          <div className={`flex h-14 w-14 items-center justify-center rounded-full ${
            member.gender === "male" ? "bg-primary/10 text-primary" : "bg-pink-100 text-pink-600"
          }`}>
            <User className="h-7 w-7" />
          </div>
          <div>
            <h2 className="font-display text-2xl text-card-foreground">
              {member.firstName}{member.middleName ? ` ${member.middleName}` : ""} {member.lastName}
            </h2>
            <p className="text-sm text-muted-foreground">{lifespan}</p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {member.birthPlace && (
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-card-foreground">Born in {member.birthPlace}</span>
            </div>
          )}
          {member.deathPlace && (
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-card-foreground">Died in {member.deathPlace}</span>
            </div>
          )}
          {member.baptismDate && (
            <div className="flex items-center gap-3 text-sm">
              <Church className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-card-foreground">
                Baptised {member.baptismDate}{member.baptismPlace ? `, ${member.baptismPlace}` : ""}
              </span>
            </div>
          )}
          {member.spouseName && (
            <div className="flex items-center gap-3 text-sm">
              <Heart className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-card-foreground">
                Married {member.spouseName}
                {member.marriageDate ? `, ${member.marriageDate}` : ""}
                {member.marriagePlace ? ` in ${member.marriagePlace}` : ""}
              </span>
            </div>
          )}
          {member.parent1Name && (
            <div className="flex items-center gap-3 text-sm">
              <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-card-foreground">
                Parents: {member.parent1Name}
                {member.parent2Name ? ` & ${member.parent2Name}` : ""}
              </span>
            </div>
          )}
          {member.childrenNames.length > 0 && (
            <div className="flex items-start gap-3 text-sm">
              <Users className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
              <div>
                <span className="text-card-foreground font-medium">
                  {member.childrenNames.length} {member.childrenNames.length === 1 ? "child" : "children"}:
                </span>
                <ul className="mt-1 space-y-0.5">
                  {member.childrenNames.map((c) => (
                    <li key={c} className="text-muted-foreground">{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Historical Events */}
        {events.length > 0 && (
          <div className="mt-6 border-t border-border pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Scroll className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-card-foreground">
                Historical Events During Their Lifetime
              </h3>
            </div>
            <div className="space-y-2">
              {events.map((event) => {
                const style = categoryStyles[event.category];
                return (
                  <div
                    key={event.name}
                    className="rounded-lg bg-secondary/50 px-3 py-2"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-sm mt-0.5">{style.emoji}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-card-foreground">
                          {event.name}
                          <span className="ml-2 text-xs text-muted-foreground">
                            {event.year}{event.endYear && event.endYear !== event.year ? `–${event.endYear}` : ""}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {event.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {/* View Profile link */}
        <div className="mt-6 border-t border-border pt-4">
          <button
            onClick={() => { onClose(); navigate(`/member/${member.id}`); }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <ExternalLink className="h-4 w-4" />
            View Full Profile
          </button>
        </div>
      </div>
    </div>
  );
}
