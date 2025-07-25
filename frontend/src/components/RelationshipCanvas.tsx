import React, { useMemo, useState, useEffect, useCallback } from "react";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  Position,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { motion } from "framer-motion";
import dagre from "dagre";

import { Filter, Users, Building, HelpCircle, Sigma, Grid3X3, Circle } from "lucide-react";
import type { Entity } from "@/types";
import { EntityCard } from "./EntityCard";
import { RingCanvas } from "./RingCanvas";
import { cn, getRelationshipScoreColor } from "@/lib/utils";

interface RelationshipCanvasProps {
  entities: Entity[];
  onEntityClick: (entity: Entity) => void;
  className?: string;
}

const CustomNode = ({
  data,
}: {
  data: {
    entity: Entity;
    onEntityClick: (entity: Entity) => void;
    isProtagonist: boolean;
  };
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ type: "spring", stiffness: 260, damping: 20 }}
    className="w-48"
  >
    <EntityCard
      entity={data.entity}
      onEntityClick={data.onEntityClick}
      isProtagonist={data.isProtagonist}
    />
  </motion.div>
);

const nodeTypes = { entityCard: CustomNode };
const nodeWidth = 192; // w-48
const nodeHeight = 288; // Estimate based on aspect ratio and content

const getRadialLayoutElements = (nodes: Node[], edges: Edge[]) => {
  if (nodes.length === 0) return { nodes, edges };

  const protagonist = nodes.find((node) => node.data.isProtagonist);
  const otherNodes = nodes.filter((node) => !node.data.isProtagonist);

  if (!protagonist) {
    // Fallback if no protagonist is found (e.g., return grid layout)
    return getLayoutedElements(nodes, edges);
  }

  const radius = Math.max(400, 150 + otherNodes.length * 25);
  const angleStep =
    otherNodes.length <= 1 ? 0 : (2 * Math.PI) / otherNodes.length;

  protagonist.position = { x: 0, y: 0 };
  protagonist.targetPosition = Position.Top;
  protagonist.sourcePosition = Position.Bottom;

  const layoutedNodes = [
    protagonist,
    ...otherNodes.map((node, i) => {
      const angle = angleStep * i - Math.PI / 2; // Start from top
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);

      return {
        ...node,
        targetPosition: Position.Top,
        sourcePosition: Position.Bottom,
        position: { x, y },
      };
    }),
  ];

  // We are using radial layout, so we don't need to layout edges with dagre
  // But we still need to return them.
  const layoutedEdges = edges.map((edge) => ({
    ...edge,
    type: "smoothstep",
    animated: true,
  }));

  return { nodes: layoutedNodes, edges: layoutedEdges };
};

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction = "TB",
) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction, nodesep: 100, ranksep: 120 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
    };
  });

  return { nodes: layoutedNodes, edges };
};

export const RelationshipCanvas: React.FC<RelationshipCanvasProps> = ({
  entities,
  onEntityClick,
  className,
}) => {
  const [filter, setFilter] = useState<"all" | "person" | "company">("all");
  const [layoutMode, setLayoutMode] = useState<"flow" | "ring">("flow");
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const filteredEntities = useMemo(() => {
    if (filter === "all") return entities;
    const protagonist = entities.find((e) => e.id === 0);
    const others = entities.filter((e) => e.id !== 0 && e.tag === filter);
    if (protagonist) {
      return [protagonist, ...others];
    }
    return others;
  }, [entities, filter]);

  const onLayout = useCallback(() => {
    const initialNodes: Node[] = filteredEntities.map((entity) => ({
      id: `entity-${entity.id}`,
      type: "entityCard",
      data: {
        entity,
        onEntityClick: onEntityClick,
        isProtagonist: entity.id === 0,
      },
      position: { x: 0, y: 0 },
      style: {
        width: nodeWidth,
        height: "auto", // Allow height to be determined by content
      },
    }));

    const initialEdges: Edge[] = filteredEntities
      .filter((entity) => entity.id !== 0)
      .map((entity, index) => {
        const baseColor = getRelationshipScoreColor(entity.relationship_score);
        const strokeWidth = 2 + (entity.relationship_score / 10) * 4;

        // Add variety to connection lines
        const lineVariations = [
          { type: "smoothstep", animated: true },
          { type: "straight", animated: false },
          { type: "step", animated: true },
        ];

        const variation = lineVariations[index % lineVariations.length];

        // Add subtle randomization to colors while maintaining readability
        const colorVariations = [
          baseColor,
          `${baseColor}CC`, // Add transparency
          baseColor,
        ];

        const finalColor = colorVariations[index % colorVariations.length];

        return {
          id: `edge-0-${entity.id}`,
          source: "entity-0",
          target: `entity-${entity.id}`,
          type: variation.type,
          animated: variation.animated,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: finalColor,
            width: 20,
            height: 20,
          },
          style: {
            stroke: finalColor,
            strokeWidth: strokeWidth,
            strokeDasharray: index % 4 === 3 ? "5,5" : undefined, // Add dashed lines occasionally
          },
        };
      });

    const { nodes: layoutedNodes, edges: layoutedEdges } =
      getRadialLayoutElements(initialNodes, initialEdges);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [filteredEntities, onEntityClick, setNodes, setEdges]);

  useEffect(() => {
    onLayout();
  }, [onLayout]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn("w-full h-full relative", className)}
    >
      {layoutMode === "flow" ? (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
          fitViewOptions={{ padding: 0.1, duration: 800 }}
          minZoom={0.2}
          className="bg-dots"
        >
          <Background />
          <Controls className="!bottom-5 md:!bottom-10 !left-auto !right-3 md:!right-5 !top-auto !m-0 !transform-none" />
          <MiniMap
            nodeColor={(n: Node) =>
              n.data.isProtagonist
                ? "hsl(var(--primary))"
                : getRelationshipScoreColor(n.data.entity.relationship_score)
            }
            nodeStrokeWidth={3}
            pannable
            className="!bottom-5 md:!bottom-10 !left-3 md:!left-5 !h-32 md:!h-40 !w-48 md:!w-60 !border-2 !border-white/20 !bg-black/40 !shadow-xl backdrop-blur-md"
          />
        </ReactFlow>
      ) : (
        <RingCanvas
          entities={filteredEntities}
          onEntityClick={onEntityClick}
          className="w-full h-full"
        />
      )}

      {/* 统一的控制面板 */}
      <div className="absolute top-3 md:top-5 left-3 md:left-5 right-3 md:right-5 flex flex-col md:flex-row justify-between items-start gap-3 md:gap-0 pointer-events-none">
        {/* Left Controls - Filters & Layout */}
        <div className="flex flex-col gap-2 md:gap-3 pointer-events-auto">
          <FilterControl filter={filter} setFilter={setFilter} />
          <LayoutControl layoutMode={layoutMode} setLayoutMode={setLayoutMode} />
        </div>

        {/* Right Controls - Stats & Help */}
        <div className="flex flex-col gap-2 md:gap-3 pointer-events-auto">
          <StatsPanel
            total={entities.length}
            shown={filteredEntities.length}
          />
          <div className="hidden md:block">
            <HelpPanel layoutMode={layoutMode} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- UI Components ---

const FilterControl: React.FC<{
  filter: string;
  setFilter: (f: "all" | "person" | "company") => void;
}> = ({ filter, setFilter }) => (
  <div className="bg-black/40 backdrop-blur-md rounded-lg shadow-lg border border-white/20 p-2 flex items-center space-x-1">
    <Filter className="w-5 h-5 text-gray-300 mx-1" />
    {[
      { key: "all", label: "All" },
      { key: "person", label: "Person", icon: Users },
      { key: "company", label: "Companies", icon: Building },
    ].map(({ key, label, icon: Icon }) => (
      <button
        key={key}
        onClick={() => setFilter(key as "all" | "person" | "company")}
        className={cn(
          "px-2 md:px-3 py-1 md:py-1.5 rounded-md text-xs md:text-sm font-light transition-all duration-200 flex items-center space-x-1 md:space-x-1.5",
          filter === key
            ? "bg-primary text-primary-foreground shadow"
            : "text-gray-300 hover:bg-white/20 hover:text-white",
        )}
      >
        {Icon && <Icon className="w-3 h-3 md:w-4 md:h-4" />}
        <span>{label}</span>
      </button>
    ))}
  </div>
);

const StatsPanel: React.FC<{ total: number; shown: number }> = ({
  total,
  shown,
}) => (
  <div className="bg-black/40 backdrop-blur-md rounded-lg shadow-lg border border-white/20 p-3 pl-4 pr-5">
    <div className="flex items-center space-x-3">
      <Sigma className="w-6 h-6 text-gray-300" />
      <div className="text-sm font-apple-text">
        <div className="text-gray-300">
          Total Entities /{" "}
          <span className="font-medium text-white">{total}</span>
        </div>
        <div className="text-gray-300">
          Currently Shown /{" "}
          <span className="font-medium text-white">{shown}</span>
        </div>
      </div>
    </div>
  </div>
);

const LayoutControl: React.FC<{
  layoutMode: string;
  setLayoutMode: (mode: "flow" | "ring") => void;
}> = ({ layoutMode, setLayoutMode }) => (
  <div className="bg-black/40 backdrop-blur-md rounded-lg shadow-lg border border-white/20 p-2 flex items-center space-x-1">
    <Grid3X3 className="w-5 h-5 text-gray-300 mx-1" />
    {[
      { key: "flow", label: "网络图", icon: Grid3X3 },
      { key: "ring", label: "3D圆环", icon: Circle },
    ].map(({ key, label, icon: Icon }) => (
      <button
        key={key}
        onClick={() => setLayoutMode(key as "flow" | "ring")}
        className={cn(
          "px-2 md:px-3 py-1 md:py-1.5 rounded-md text-xs md:text-sm font-light transition-all duration-200 flex items-center space-x-1 md:space-x-1.5",
          layoutMode === key
            ? "bg-primary text-primary-foreground shadow"
            : "text-gray-300 hover:bg-white/20 hover:text-white",
        )}
      >
        <Icon className="w-3 h-3 md:w-4 md:h-4" />
        <span>{label}</span>
      </button>
    ))}
  </div>
);

const HelpPanel: React.FC<{ layoutMode: "flow" | "ring" }> = ({ layoutMode }) => (
  <div className="bg-black/40 backdrop-blur-md rounded-lg shadow-lg border border-white/20 p-3 pl-4 pr-5">
    <div className="flex items-center space-x-3">
      <HelpCircle className="w-6 h-6 text-gray-300" />
      <div className="text-xs text-gray-300 font-apple-text space-y-1">
        {layoutMode === "flow" ? (
          <>
            <div>• Drag cards, scroll to zoom, drag background</div>
            <div>• Click cards to view details</div>
          </>
        ) : (
          <>
            <div>• Click cards to flip and view details</div>
            <div>• Cards rotate automatically in 3D space</div>
          </>
        )}
      </div>
    </div>
  </div>
);
