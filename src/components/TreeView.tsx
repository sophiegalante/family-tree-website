import { useState, useEffect } from "react";
import { type FamilyMember } from "@/data/familyData";
import { useFamilyMembers } from "@/hooks/useFamilyMembers";
import PersonCard from "./PersonCard";
import MemberDetail from "./MemberDetail";
import { ChevronDown, ChevronRight } from "lucide-react";

function MemberRow({ member, depth = 0, allMembers, onSelect }: {
  member: FamilyMember;
  depth?: number;
  allMembers: FamilyMember[];
  onSelect: (m: FamilyMember) => void;
}) {
  // Find children in the same branch by checking if this member's commonName
  // appears as parent1 or parent2 of other members
  const children = allMembers.filter(
    (m) =>
      m.id !== member.id &&
      (m.parent1Name === member.commonName.replace(/\s*\(.*\)/, "") ||
        m.parent2Name === member.commonName.replace(/\s*\(.*\)/, "") ||
        // Also match by first+last name
        m.parent1Name === `${member.firstName} ${member.lastName}` ||
        m.parent2Name === `${member.firstName} ${member.lastName}`)
  );

  const [expanded, setExpanded] = useState(depth < 2);

  return (
    <div>
      <div className="flex items-start gap-2">
        {children.length > 0 ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        ) : (
          <div className="w-6 shrink-0" />
        )}
        <div className="flex-1 max-w-sm">
          <PersonCard
            member={member}
            compact={depth > 1}
            onClick={() => onSelect(member)}
          />
        </div>
      </div>

      {expanded && children.length > 0 && (
        <div className="ml-9 mt-2 space-y-2 border-l-2 border-border pl-4">
          {children.map((child) => (
            <MemberRow
              key={child.id}
              member={child}
              depth={depth + 1}
              allMembers={allMembers}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TreeView() {
  const { branches, getMembersByBranch, isLoading } = useFamilyMembers();
  const [activeBranch, setActiveBranch] = useState("");
  const [selected, setSelected] = useState<FamilyMember | null>(null);

  useEffect(() => {
    if (branches.length > 0 && !activeBranch) {
      setActiveBranch(branches[0].pageId);
    }
  }, [branches, activeBranch]);

  if (isLoading) {
    return <div className="p-4 text-muted-foreground">Loading tree…</div>;
  }

  const branchMembers = getMembersByBranch(activeBranch);
  const rootMember = branchMembers[0];

  return (
    <div>
      {/* Branch selector */}
      <div className="mb-6 flex flex-wrap gap-2">
        {branches.map((b) => (
          <button
            key={b.pageId}
            onClick={() => setActiveBranch(b.pageId)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              activeBranch === b.pageId
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {b.label}
          </button>
        ))}
      </div>

      {/* Tree */}
      <div className="space-y-2">
        {rootMember && (
          <MemberRow
            member={rootMember}
            allMembers={branchMembers}
            onSelect={setSelected}
          />
        )}
      </div>

      {selected && (
        <MemberDetail member={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
