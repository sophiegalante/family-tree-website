import { useState, useEffect, useMemo, useCallback } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
  type NodeProps,
  Handle,
  Position,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Dagre from "@dagrejs/dagre";
import { User } from "lucide-react";
import { type FamilyMember } from "@/data/familyData";
import { useFamilyMembers } from "@/hooks/useFamilyMembers";
import MemberDetail from "./MemberDetail";

// ─── Layout constants ─────────────────────────────────────────────────────────
const NODE_W     = 180;
const NODE_H     = 76;
const COUPLE_GAP = 36;   // horizontal gap between spouses
const UNIT_GAP   = 48;   // horizontal gap between couple units in the same row
const V_GAP      = 100;  // vertical gap between generations
const JCT_SIZE   = 8;    // junction node size (px)

// ─── Node / edge data types ───────────────────────────────────────────────────
type PersonNodeData = {
  member:   FamilyMember;
  isFocus:  boolean;
  generation: number;
  onFocus:  (m: FamilyMember) => void;
  onSelect: (m: FamilyMember) => void;
};

// ─── Person node ──────────────────────────────────────────────────────────────
function PersonNode({ data }: NodeProps) {
  const { member, isFocus, generation, onFocus, onSelect } =
    data as PersonNodeData;
  const isFemale = member.gender === "female";
  const years = [member.birthYear, member.deathYear ?? null]
    .filter(Boolean)
    .join("–");

  return (
    <>
      {/* top / left / right / bottom handles for flexible edge routing */}
      <Handle type="target"  id="top"    position={Position.Top}    style={{ opacity: 0 }} />
      <Handle type="target"  id="left"   position={Position.Left}   style={{ opacity: 0 }} />
      <Handle type="source"  id="right"  position={Position.Right}  style={{ opacity: 0 }} />
      <Handle type="source"  id="bottom" position={Position.Bottom} style={{ opacity: 0 }} />

      <div
        onClick={() => (isFocus ? onSelect(member) : onFocus(member))}
        title={isFocus ? "Click to view details" : "Click to focus"}
        className={[
          "w-[180px] rounded-lg border-2 bg-card px-3 py-2 shadow-sm cursor-pointer",
          "transition-all hover:shadow-md hover:-translate-y-0.5",
          isFocus
            ? "border-primary ring-2 ring-primary/30"
            : isFemale ? "border-rose-300" : "border-blue-300",
          Math.abs(generation) === 2 ? "opacity-75" : "opacity-100",
        ].join(" ")}
      >
        {isFocus && (
          <div className="mb-1 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-primary">
            <User className="h-2.5 w-2.5" /> Focus
          </div>
        )}
        <p className="truncate text-xs font-semibold text-foreground leading-tight">
          {member.firstName} {member.lastName}
        </p>
        {years && (
          <p className="mt-0.5 text-[10px] text-muted-foreground">{years}</p>
        )}
        {member.birthPlace && (
          <p className="truncate text-[10px] text-muted-foreground">
            {member.birthPlace}
          </p>
        )}
      </div>
    </>
  );
}

// ─── Junction node (small dot where parent lines converge) ────────────────────
function JunctionNode() {
  return (
    <>
      <Handle type="target" position={Position.Top}    style={{ opacity: 0 }} />
      <div
        style={{ width: JCT_SIZE, height: JCT_SIZE }}
        className="rounded-full bg-muted-foreground/50"
      />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </>
  );
}

const nodeTypes = { person: PersonNode, junction: JunctionNode };

// ─── Name index ───────────────────────────────────────────────────────────────
function buildNameIndex(members: FamilyMember[]) {
  const map = new Map<string, FamilyMember>();
  members.forEach((m) => {
    map.set(m.commonName.replace(/\s*\(.*\)/, "").toLowerCase(), m);
    map.set(`${m.firstName} ${m.lastName}`.toLowerCase(), m);
  });
  return map;
}

function lookup(name: string | undefined, idx: Map<string, FamilyMember>) {
  if (!name) return undefined;
  return idx.get(name.toLowerCase());
}

// ─── Edge factories ───────────────────────────────────────────────────────────
function marriageEdge(aId: string, bId: string): Edge {
  return {
    id: `marriage-${aId}-${bId}`,
    source: aId, sourceHandle: "right",
    target: bId, targetHandle: "left",
    type: "straight",
    style: { stroke: "#e5625e", strokeWidth: 2 },
  };
}

function parentChildEdge(
  srcId: string, tgtId: string,
  srcHandle = "bottom", tgtHandle = "top"
): Edge {
  return {
    id: `${srcId}→${tgtId}`,
    source: srcId, sourceHandle: srcHandle,
    target: tgtId, targetHandle: tgtHandle,
    type: "smoothstep",
    markerEnd: { type: MarkerType.ArrowClosed, width: 8, height: 8 },
    style: { stroke: "hsl(var(--border))", strokeWidth: 1.5 },
  };
}

// ─── Couple unit ──────────────────────────────────────────────────────────────
interface CoupleUnit {
  kind: "couple";
  a: FamilyMember;
  b: FamilyMember;
  jctId: string;
}
interface SingleUnit { kind: "single"; m: FamilyMember }
type Unit = CoupleUnit | SingleUnit;

function unitWidth(u: Unit) {
  return u.kind === "couple" ? 2 * NODE_W + COUPLE_GAP : NODE_W;
}

// ─── Build FOCUS graph with couple layout ─────────────────────────────────────
function buildFocusGraph(
  focus: FamilyMember,
  all:   FamilyMember[],
  onFocus:  (m: FamilyMember) => void,
  onSelect: (m: FamilyMember) => void,
): { nodes: Node[]; edges: Edge[] } {
  const idx    = buildNameIndex(all);
  const inSet  = new Set(all.map((m) => m.id));
  const res    = (name?: string) => { const m = lookup(name, idx); return m && inSet.has(m.id) ? m : undefined; };
  const spouse = (m: FamilyMember) => res(m.spouseName);

  // Helper: find children of a member
  const childrenOf = (m: FamilyMember) => {
    const names = new Set([
      m.commonName.replace(/\s*\(.*\)/, "").toLowerCase(),
      `${m.firstName} ${m.lastName}`.toLowerCase(),
    ]);
    return all.filter(
      (c) => c.id !== m.id &&
        ((c.parent1Name && names.has(c.parent1Name.toLowerCase())) ||
         (c.parent2Name && names.has(c.parent2Name.toLowerCase())))
    );
  };

  // Relatives
  const p1 = res(focus.parent1Name);
  const p2 = res(focus.parent2Name);
  const gp1a = p1 ? res(p1.parent1Name) : undefined;
  const gp1b = p1 ? res(p1.parent2Name) : undefined;
  const gp2a = p2 ? res(p2.parent1Name) : undefined;
  const gp2b = p2 ? res(p2.parent2Name) : undefined;

  const focusSpouse = spouse(focus);

  // Siblings (share a parent, exclude focus and focusSpouse)
  const siblings = all.filter(
    (m) => m.id !== focus.id && focusSpouse?.id !== m.id &&
      ((focus.parent1Name &&
          (m.parent1Name === focus.parent1Name || m.parent2Name === focus.parent1Name)) ||
       (focus.parent2Name &&
          (m.parent1Name === focus.parent2Name || m.parent2Name === focus.parent2Name)))
  );

  // Children (from focus + focusSpouse)
  const childSet = new Map<string, FamilyMember>();
  [...childrenOf(focus), ...(focusSpouse ? childrenOf(focusSpouse) : [])]
    .forEach((c) => childSet.set(c.id, c));
  const children = [...childSet.values()];

  // Grandchildren
  const gcSet = new Map<string, FamilyMember>();
  children.flatMap(childrenOf).forEach((m) => gcSet.set(m.id, m));
  const grandchildren = [...gcSet.values()];

  // ── Build units per generation ────────────────────────────────────────────
  const added = new Set<string>(); // track who already has a unit

  function makeUnit(a: FamilyMember, b?: FamilyMember): Unit {
    added.add(a.id);
    if (b) {
      added.add(b.id);
      return { kind: "couple", a, b, jctId: `jct-${a.id}` };
    }
    return { kind: "single", m: a };
  }

  // Gen -2: grandparent pairs
  const g2: Unit[] = [];
  function addGpPair(ga?: FamilyMember, gb?: FamilyMember) {
    if (!ga && !gb) return;
    if (ga && !added.has(ga.id) && gb && !added.has(gb.id)) { g2.push(makeUnit(ga, gb)); return; }
    if (ga && !added.has(ga.id)) g2.push(makeUnit(ga));
    if (gb && !added.has(gb.id)) g2.push(makeUnit(gb));
  }
  addGpPair(gp1a, gp1b);
  addGpPair(gp2a, gp2b);

  // Gen -1: parents as a couple
  const g1: Unit[] = [];
  if (p1 && !added.has(p1.id) && p2 && !added.has(p2.id)) g1.push(makeUnit(p1, p2));
  else if (p1 && !added.has(p1.id)) g1.push(makeUnit(p1));
  else if (p2 && !added.has(p2.id)) g1.push(makeUnit(p2));

  // Gen 0: focus (+ spouse), then siblings
  const g0: Unit[] = [];
  g0.push(focusSpouse ? makeUnit(focus, focusSpouse) : makeUnit(focus));

  for (const sib of siblings) {
    if (added.has(sib.id)) continue;
    const sp = spouse(sib);
    if (sp && !added.has(sp.id)) g0.push(makeUnit(sib, sp));
    else g0.push(makeUnit(sib));
  }

  // Gen +1: children (+ their spouses)
  const g1plus: Unit[] = [];
  for (const child of children) {
    if (added.has(child.id)) continue;
    const sp = spouse(child);
    if (sp && !added.has(sp.id)) g1plus.push(makeUnit(child, sp));
    else g1plus.push(makeUnit(child));
  }

  // Gen +2: grandchildren as singles
  const g2plus: Unit[] = grandchildren
    .filter((m) => !added.has(m.id))
    .map((m) => makeUnit(m));

  // ── Position units into nodes ─────────────────────────────────────────────
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  // Maps each member id to the source id for child edges (junction or self)
  const childEdgeSrc = new Map<string, string>();

  const generations = [
    { gen: -2, units: g2 },
    { gen: -1, units: g1 },
    { gen:  0, units: g0 },
    { gen:  1, units: g1plus },
    { gen:  2, units: g2plus },
  ];

  for (const { gen, units } of generations) {
    if (!units.length) continue;
    const rowY = gen * (NODE_H + V_GAP);

    // Total row width
    const totalW =
      units.reduce((s, u) => s + unitWidth(u), 0) +
      (units.length - 1) * UNIT_GAP;
    let x = -totalW / 2;

    for (const unit of units) {
      if (unit.kind === "couple") {
        const { a, b, jctId } = unit;
        const ax = x, bx = x + NODE_W + COUPLE_GAP;
        const centerX = x + NODE_W + COUPLE_GAP / 2;
        const jctY = rowY + NODE_H + V_GAP / 2 - JCT_SIZE / 2;
        const jctX = centerX - JCT_SIZE / 2;

        // Person nodes
        nodes.push(personNode(a, ax, rowY, a.id === focus.id, gen, onFocus, onSelect));
        nodes.push(personNode(b, bx, rowY, false, gen, onFocus, onSelect));

        // Junction node
        nodes.push({
          id: jctId,
          type: "junction",
          position: { x: jctX, y: jctY },
          data: {},
          style: { width: JCT_SIZE, height: JCT_SIZE },
        });

        // Marriage edge (A ─ B)
        edges.push(marriageEdge(a.id, b.id));

        // A.bottom → junction & B.bottom → junction
        edges.push(parentChildEdge(a.id, jctId, "bottom", "top"));
        edges.push(parentChildEdge(b.id, jctId, "bottom", "top"));

        // Both parents map to this junction for child routing
        childEdgeSrc.set(a.id, jctId);
        childEdgeSrc.set(b.id, jctId);
      } else {
        nodes.push(personNode(unit.m, x, rowY, unit.m.id === focus.id, gen, onFocus, onSelect));
        childEdgeSrc.set(unit.m.id, unit.m.id);
      }

      x += unitWidth(unit) + UNIT_GAP;
    }
  }

  // ── Parent → child edges ──────────────────────────────────────────────────
  const visibleIds = new Set(nodes.map((n) => n.id));
  const seenEdges  = new Set<string>();

  // For each visible person node, connect from their parents
  nodes.forEach((node) => {
    if (node.type !== "person") return;
    const child = (node.data as PersonNodeData).member;

    let routed = false;
    for (const pName of [child.parent1Name, child.parent2Name]) {
      const parent = lookup(pName, idx);
      if (!parent || !visibleIds.has(parent.id)) continue;

      const src = childEdgeSrc.get(parent.id);
      if (!src) continue;

      const eid = `${src}→${child.id}`;
      if (seenEdges.has(eid)) continue;
      seenEdges.add(eid);

      const srcIsJunction = src.startsWith("jct-");
      edges.push(parentChildEdge(src, child.id, "bottom", "top"));
      routed = true;
      break; // one route per child is enough (via junction or single parent)
    }
  });

  return { nodes, edges };
}

// ─── Helper: create a person Node object ─────────────────────────────────────
function personNode(
  m: FamilyMember, x: number, y: number,
  isFocus: boolean, generation: number,
  onFocus: (m: FamilyMember) => void,
  onSelect: (m: FamilyMember) => void,
): Node {
  return {
    id: m.id,
    type: "person",
    position: { x, y },
    style: { width: NODE_W, height: NODE_H },
    data: { member: m, isFocus, generation, onFocus, onSelect },
  };
}

// ─── Build FULL branch graph with Dagre + marriage edges ─────────────────────
function buildFullGraph(
  members: FamilyMember[],
  onFocus:  (m: FamilyMember) => void,
  onSelect: (m: FamilyMember) => void,
): { nodes: Node[]; edges: Edge[] } {
  const idx = buildNameIndex(members);

  const rawNodes: Node[] = members.map((m) => ({
    id: m.id, type: "person",
    position: { x: 0, y: 0 },
    style: { width: NODE_W, height: NODE_H },
    data: { member: m, isFocus: false, generation: 0, onFocus, onSelect },
  }));

  const seenE = new Set<string>();
  const edges: Edge[] = [];

  // Parent-child edges
  members.forEach((child) => {
    [child.parent1Name, child.parent2Name].forEach((pName) => {
      const parent = lookup(pName, idx);
      if (!parent) return;
      const eid = `${parent.id}→${child.id}`;
      if (seenE.has(eid)) return;
      seenE.add(eid);
      edges.push(parentChildEdge(parent.id, child.id));
    });
  });

  // Marriage edges (where both spouses are in the branch)
  const inBranch = new Set(members.map((m) => m.id));
  const seenM = new Set<string>();
  members.forEach((m) => {
    if (!m.spouseName) return;
    const sp = lookup(m.spouseName, idx);
    if (!sp || !inBranch.has(sp.id)) return;
    const mid = [m.id, sp.id].sort().join("-");
    if (seenM.has(mid)) return;
    seenM.add(mid);
    edges.push(marriageEdge(m.id, sp.id));
  });

  // Dagre layout
  const g = new Dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "TB", nodesep: UNIT_GAP, ranksep: V_GAP });
  // Only include parent-child edges in Dagre (marriage edges would break the DAG)
  rawNodes.forEach((n) => g.setNode(n.id, { width: NODE_W, height: NODE_H }));
  edges
    .filter((e) => !e.id.startsWith("marriage-"))
    .forEach((e) => g.setEdge(e.source, e.target));
  Dagre.layout(g);

  const nodes = rawNodes.map((n) => {
    const pos = g.node(n.id);
    return { ...n, position: { x: pos.x - NODE_W / 2, y: pos.y - NODE_H / 2 } };
  });

  return { nodes, edges };
}

// ─── Inner canvas (needs ReactFlowProvider context for fitView) ───────────────
function TreeCanvas({
  nodes, edges, onNodesChange, onEdgesChange,
}: {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: ReturnType<typeof useNodesState>[2];
  onEdgesChange: ReturnType<typeof useEdgesState>[2];
}) {
  const { fitView } = useReactFlow();

  useEffect(() => {
    if (!nodes.length) return;
    const t = setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 50);
    return () => clearTimeout(t);
  }, [nodes, fitView]);

  return (
    <ReactFlow
      nodes={nodes} edges={edges}
      onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      minZoom={0.05} maxZoom={2}
      proOptions={{ hideAttribution: true }}
    >
      <Background color="hsl(var(--border))" gap={20} size={1} />
      <Controls showInteractive={false} />
    </ReactFlow>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
type ViewMode = "focus" | "full";

export default function TreeView() {
  const { members, branches, isLoading }         = useFamilyMembers();
  const [activeBranch, setActiveBranch]          = useState("");
  const [viewMode, setViewMode]                  = useState<ViewMode>("focus");
  const [focusMember, setFocusMember]            = useState<FamilyMember | null>(null);
  const [detailMember, setDetailMember]          = useState<FamilyMember | null>(null);
  const [nodes, setNodes, onNodesChange]         = useNodesState([]);
  const [edges, setEdges, onEdgesChange]         = useEdgesState([]);

  const handleFocus  = useCallback((m: FamilyMember) => setFocusMember(m), []);
  const handleSelect = useCallback((m: FamilyMember) => setDetailMember(m), []);

  const branchMembers = useMemo(
    () => members.filter((m) => m.pageId === activeBranch),
    [members, activeBranch]
  );

  useEffect(() => {
    if (branches.length > 0 && !activeBranch) setActiveBranch(branches[0].pageId);
  }, [branches, activeBranch]);

  useEffect(() => {
    if (branchMembers.length > 0) setFocusMember(branchMembers[0]);
  }, [branchMembers]);

  useEffect(() => {
    if (!branchMembers.length) return;
    if (viewMode === "focus" && focusMember) {
      const { nodes: n, edges: e } = buildFocusGraph(focusMember, branchMembers, handleFocus, handleSelect);
      setNodes(n); setEdges(e);
    } else if (viewMode === "full") {
      const { nodes: n, edges: e } = buildFullGraph(branchMembers, handleFocus, handleSelect);
      setNodes(n); setEdges(e);
    }
  }, [branchMembers, focusMember, viewMode, handleFocus, handleSelect, setNodes, setEdges]);

  if (isLoading) {
    return <div className="flex h-[600px] items-center justify-center text-muted-foreground">Loading tree…</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Controls row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {branches.map((b) => (
            <button key={b.pageId} onClick={() => setActiveBranch(b.pageId)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeBranch === b.pageId
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >{b.label}</button>
          ))}
        </div>
        <div className="flex items-center gap-1 rounded-full border border-border bg-secondary p-1 text-sm">
          {(["focus", "full"] as ViewMode[]).map((mode) => (
            <button key={mode} onClick={() => setViewMode(mode)}
              className={`rounded-full px-3 py-1 transition-all ${
                viewMode === mode ? "bg-card font-medium text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >{mode === "focus" ? "Focus view" : "Full branch"}</button>
          ))}
        </div>
      </div>

      {/* Focus banner */}
      {viewMode === "focus" && focusMember && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-4 py-2 text-sm">
          <User className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="text-muted-foreground">Focused on:</span>
          <span className="font-medium text-foreground">{focusMember.firstName} {focusMember.lastName}</span>
          {focusMember.birthYear
            ? <span className="text-muted-foreground">({focusMember.birthYear}{focusMember.deathYear ? `–${focusMember.deathYear}` : ""})</span>
            : null}
          <span className="ml-auto text-xs text-muted-foreground hidden sm:block">
            ±2 generations · Click any card to refocus · Click the focused card for details
          </span>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm border-2 border-blue-300 bg-card" /> Male</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm border-2 border-rose-300 bg-card" /> Female</span>
        {viewMode === "focus" && (
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm border-2 border-primary ring-2 ring-primary/30 bg-card" /> Focus</span>
        )}
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-5 border-t-2 border-[#e5625e]" /> Marriage
        </span>
        <span className="ml-auto">Scroll to zoom · Drag to pan</span>
      </div>

      {/* Canvas */}
      <div className="h-[640px] rounded-xl border border-border overflow-hidden">
        <ReactFlowProvider>
          <TreeCanvas nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} />
        </ReactFlowProvider>
      </div>

      {detailMember && (
        <MemberDetail member={detailMember} onClose={() => setDetailMember(null)} />
      )}
    </div>
  );
}
