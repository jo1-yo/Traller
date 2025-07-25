import React, { useMemo, useState, useEffect, useCallback } from 'react';
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
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import dagre from 'dagre';
import { Filter, Users, Building, HelpCircle, Sigma, Calendar } from 'lucide-react';
import type { Entity } from '@/types';
import { EntityCard } from './EntityCard';
import { cn, getRelationshipScoreColor } from '@/lib/utils';

interface RelationshipCanvasProps {
  entities: Entity[];
  onEntityClick: (entity: Entity) => void;
  className?: string;
}

const CustomNode = ({ data }: { data: { entity: Entity; onEntityClick: (entity: Entity) => void; isProtagonist: boolean } }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <EntityCard
        entity={data.entity}
        onEntityClick={data.onEntityClick}
        isProtagonist={data.isProtagonist}
      />
    </motion.div>
  );
};

const nodeTypes = { entityCard: CustomNode };
const nodeWidth = 256; 
const nodeHeight = 144; // Adjusted for new card height

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
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
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
      position: { x: nodeWithPosition.x - nodeWidth / 2, y: nodeWithPosition.y - nodeHeight / 2 },
    };
  });

  return { nodes: layoutedNodes, edges };
};


export const RelationshipCanvas: React.FC<RelationshipCanvasProps> = ({
  entities,
  onEntityClick,
  className,
}) => {
  const [filter, setFilter] = useState<'all' | 'people' | 'company' | 'event'>('all');
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const filteredEntities = useMemo(() => {
    if (filter === 'all') return entities;
    return entities.filter(entity => 
      (entity.tag === filter) || entity.id === 0 // Always include protagonist
    );
  }, [entities, filter]);

  const onLayout = useCallback(() => {
    const initialNodes: Node[] = filteredEntities.map((entity) => ({
      id: `entity-${entity.id}`,
      type: 'entityCard',
      data: {
        entity,
        onEntityClick: onEntityClick,
        isProtagonist: entity.id === 0,
      },
      position: { x: 0, y: 0 },
    }));

    const initialEdges: Edge[] = filteredEntities
      .filter((entity) => entity.id !== 0)
      .map((entity) => ({
        id: `edge-0-${entity.id}`,
        source: 'entity-0',
        target: `entity-${entity.id}`,
        type: 'smoothstep',
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed, color: getRelationshipScoreColor(entity.relationship_score) },
        style: {
          stroke: getRelationshipScoreColor(entity.relationship_score),
          strokeWidth: 1 + (entity.relationship_score / 10) * 3,
        },
      }));

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges);
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
      className={cn('w-full h-full relative', className)}
    >
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
        <Controls className="!bottom-10 !left-auto !right-5 !top-auto !m-0 !transform-none" />
        <MiniMap
          nodeColor={(n: Node) => n.data.isProtagonist ? 'hsl(var(--primary))' : getRelationshipScoreColor(n.data.entity.relationship_score)}
          nodeStrokeWidth={3}
          pannable
          className="!bottom-10 !left-5 !h-40 !w-60 !border-2 !border-border !bg-card/80 !shadow-xl"
        />

        <div className="absolute top-5 left-5 right-5 flex justify-between items-start pointer-events-none">
          {/* Left Controls - Filters */}
          <div className="flex flex-col gap-3 pointer-events-auto">
            <FilterControl filter={filter} setFilter={setFilter} />
          </div>

          {/* Right Controls - Stats & Help */}
          <div className="flex flex-col gap-3 pointer-events-auto">
            <StatsPanel total={entities.length} shown={filteredEntities.length} />
            <HelpPanel />
          </div>
        </div>
      </ReactFlow>
    </motion.div>
  );
};

// --- UI Components ---

const FilterControl: React.FC<{
  filter: string;
  setFilter: (f: 'all' | 'people' | 'company' | 'event') => void;
}> = ({ filter, setFilter }) => (
  <div className="bg-card/80 backdrop-blur-sm rounded-lg shadow-lg border p-2 flex items-center space-x-1">
    <Filter className="w-5 h-5 text-muted-foreground mx-1" />
    {[
      { key: 'all', label: '全部' },
      { key: 'people', label: '人物', icon: Users },
      { key: 'company', label: '公司', icon: Building },
      { key: 'event', label: '事件', icon: Calendar }, // Added this
    ].map(({ key, label, icon: Icon }) => (
      <button
        key={key}
        onClick={() => setFilter(key as any)}
        className={cn(
          'px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-1.5',
          filter === key
            ? 'bg-primary text-primary-foreground shadow'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        )}
      >
        {Icon && <Icon className="w-4 h-4" />}
        <span>{label}</span>
      </button>
    ))}
  </div>
);

const StatsPanel: React.FC<{ total: number; shown: number }> = ({ total, shown }) => (
  <div className="bg-card/80 backdrop-blur-sm rounded-lg shadow-lg border p-3 pl-4 pr-5">
    <div className="flex items-center space-x-3">
      <Sigma className="w-6 h-6 text-muted-foreground" />
      <div className="text-sm">
        <div className="text-muted-foreground">总实体 / <span className="font-semibold text-foreground">{total}</span></div>
        <div className="text-muted-foreground">当前显示 / <span className="font-semibold text-foreground">{shown}</span></div>
      </div>
    </div>
  </div>
);

const HelpPanel: React.FC = () => (
  <div className="bg-card/80 backdrop-blur-sm rounded-lg shadow-lg border p-3 pl-4 pr-5">
    <div className="flex items-center space-x-3">
      <HelpCircle className="w-6 h-6 text-muted-foreground" />
      <div className="text-xs text-muted-foreground space-y-1">
        <div>• 拖拽卡片、滚轮缩放、拖动背景</div>
        <div>• 点击卡片查看详情</div>
      </div>
    </div>
  </div>
); 