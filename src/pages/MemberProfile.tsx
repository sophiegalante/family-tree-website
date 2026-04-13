import { useParams, useNavigate } from "react-router-dom";
import { useFamilyMembers } from "@/hooks/useFamilyMembers";
import { getEventsForPerson, categoryStyles } from "@/data/historicalEvents";
import { buildStoryMilestones } from "@/lib/memberStory";
import {
  ArrowLeft, User, MapPin, Heart, Users, Church, Scroll, Calendar, GitBranch, ArrowRight,
} from "lucide-react";

export default function MemberProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { members, isLoading, isError } = useFamilyMembers();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-xl text-muted-foreground">Failed to load family data</p>
          <button onClick={() => navigate("/")} className="text-primary underline">
            Back to Family Tree
          </button>
        </div>
      </div>
    );
  }

  const member = members.find((m) => m.id === id);

  if (!member) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-xl text-muted-foreground">Member not found</p>
          <button onClick={() => navigate("/")} className="text-primary underline">
            Back to Family Tree
          </button>
        </div>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();
  const presumedDeceased = !member.deathYear && currentYear - member.birthYear > 105;

  const lifespan = member.deathYear
    ? `${member.birthDate} – ${member.deathDate}`
    : presumedDeceased
      ? `${member.birthDate} – unknown`
      : `${member.birthDate} – present`;

  const lifespanShort = member.deathYear
    ? `${member.birthYear}–${member.deathYear}`
    : presumedDeceased
      ? `${member.birthYear}–unknown`
      : `${member.birthYear}–present`;
  const milestones = buildStoryMilestones(member);

  const events = getEventsForPerson(
    member.birthYear,
    member.deathYear,
    member.birthPlace,
    member.deathPlace,
    member.marriagePlace
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center gap-4 px-4 py-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h1 className="font-display text-xl text-foreground">
            {member.firstName} {member.lastName}
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex items-center gap-4">
            {/* Name, avatar & lifespan */}
            <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm w-full">
              {member.photoUrl ? (
                <img
                  src={member.photoUrl}
                  alt={`${member.firstName} ${member.lastName}`}
                  className="h-16 w-16 shrink-0 rounded-full object-cover border-2 border-border"
                />
              ) : (
                <div
                  className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full ${
                    member.gender === "male"
                      ? "bg-primary/10 text-primary"
                      : "bg-pink-100 text-pink-600"
                  }`}
                >
                  <User className="h-7 w-7" />
                </div>
              )}
              <div>
                <h2 className="font-display text-3xl text-foreground sm:text-4xl">
                  {member.firstName}
                  {member.middleName ? ` ${member.middleName}` : ""} {member.lastName}
                </h2>
                <p className="mt-1 flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {lifespan}
                </p>
                <p className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">
                  Profile Story View
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Story Strip
            </h3>
            <div className="grid gap-3 md:grid-cols-4">
              {milestones.map((milestone, index) => (
                <div key={milestone.label} className="relative rounded-xl border border-border bg-background p-4">
                  {index < milestones.length - 1 && (
                    <ArrowRight className="absolute -right-2 top-1/2 hidden h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground md:block" />
                  )}
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{milestone.label}</p>
                  <p className={`mt-2 text-sm font-semibold ${milestone.isKnown ? "text-foreground" : "text-muted-foreground"}`}>
                    {milestone.primary}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {milestone.secondary || "No details available"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-card-foreground">Profile Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Full Name</span>
                  <span className="font-medium text-card-foreground">
                    {member.firstName}
                    {member.middleName ? ` ${member.middleName}` : ""} {member.lastName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Lifespan</span>
                  <span className="font-medium text-card-foreground">{lifespanShort}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Gender</span>
                  <span className="font-medium capitalize text-card-foreground">{member.gender}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Children</span>
                  <span className="font-medium text-card-foreground">{member.childrenNames.length || "Unknown"}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-card-foreground">Life Details</h3>
              <div className="space-y-3">
                {member.birthPlace && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 shrink-0 text-primary" />
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
                      Baptised {member.baptismDate}
                      {member.baptismPlace ? `, ${member.baptismPlace}` : ""}
                    </span>
                  </div>
                )}
                {member.spouseName && (
                  <div className="flex items-center gap-3 text-sm">
                    <Heart className="h-4 w-4 shrink-0 text-pink-500" />
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
                      <span className="font-medium text-card-foreground">Children:</span>
                      <ul className="mt-1 columns-2 gap-x-6 space-y-0.5">
                        {member.childrenNames.map((c) => (
                          <li key={c} className="text-muted-foreground">{c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Biography */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-3 text-lg font-semibold text-card-foreground">Biography</h3>
              {member.biography ? (
                <p className="leading-relaxed text-muted-foreground">{member.biography}</p>
              ) : (
                <p className="italic text-muted-foreground/60">
                  No biography has been written yet. This section will hold a longer narrative about{" "}
                  {member.firstName}'s life, including their occupation, notable achievements, and
                  family stories passed down through generations.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-3 text-lg font-semibold text-card-foreground">Family Connections</h3>
              <p className="text-sm text-muted-foreground">
                Use the tree explorer to view this member's branch and related family connections.
              </p>
              <button
                onClick={() => navigate("/explore?view=tree")}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <GitBranch className="h-4 w-4" />
                View Related Branch
              </button>
            </div>
          </div>

          {/* Historical Events */}
          {events.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Scroll className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-card-foreground">
                  Historical Context
                </h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {events.map((event) => {
                  const style = categoryStyles[event.category];
                  return (
                    <div
                      key={event.name}
                      className="rounded-xl bg-secondary/50 px-4 py-3"
                    >
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 text-base">{style.emoji}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-card-foreground">
                            {event.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {event.year}
                            {event.endYear && event.endYear !== event.year
                              ? `–${event.endYear}`
                              : ""}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
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
        </div>
      </main>
    </div>
  );
}
