import React, { useMemo, useState } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ConnectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import { Filter, Users, Building } from 'lucide-react';
import type { Entity } from '@/types';
import { EntityCard } from './EntityCard';
import { cn } from '@/lib/utils';

interface RelationshipCanvasProps {
  entities: Entity[];
  onEntityClick: (entity: Entity) => void;
  className?: string;
}

const CustomNode: React.FC<{ data: { entity: Entity; onClick: () => void; isProtagonist: boolean } }> = ({ data }) => {
  return (
    <EntityCard
      entity={data.entity}
      onClick={data.onClick}
      isProtagonist={data.isProtagonist}
    />
  );
};

const nodeTypes = {
  entityCard: CustomNode,
};

export const RelationshipCanvas: React.FC<RelationshipCanvasProps> = ({
  entities,
  onEntityClick,
  className,
}) => {
  const [filter, setFilter] = useState<'all' | 'people' | 'company'>('all');

  // 过滤实体
  const filteredEntities = useMemo(() => {
    if (filter === 'all') return entities;
    return entities.filter(entity => entity.tag === filter);
  }, [entities, filter]);

  // 创建节点
  const initialNodes: Node[] = useMemo(() => {
    const protagonist = filteredEntities.find(e => e.id === 0);
    const others = filteredEntities.filter(e => e.id !== 0);
    
    const nodes: Node[] = [];
    
    // 主角位于中心
    if (protagonist) {
      nodes.push({
        id: `entity-${protagonist.id}`,
        type: 'entityCard',
        position: { x: 0, y: 0 },
        data: {
          entity: protagonist,
          onClick: () => onEntityClick(protagonist),
          isProtagonist: true,
        },
        draggable: true,
      });
    }
    
    // 其他实体围绕主角排列
    const centerX = 0;
    const centerY = 0;
    const radius = 300;
    
    others.forEach((entity, index) => {
      const angle = (index * 2 * Math.PI) / others.length;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      nodes.push({
        id: `entity-${entity.id}`,
        type: 'entityCard',
        position: { x, y },
        data: {
          entity,
          onClick: () => onEntityClick(entity),
          isProtagonist: false,
        },
        draggable: true,
      });
    });
    
    return nodes;
  }, [filteredEntities, onEntityClick]);

  // 创建边
  const initialEdges: Edge[] = useMemo(() => {
    const protagonist = entities.find(e => e.id === 0);
    if (!protagonist) return [];
    
    return filteredEntities
      .filter(entity => entity.id !== 0)
      .map(entity => ({
        id: `edge-${protagonist.id}-${entity.id}`,
        source: `entity-${protagonist.id}`,
        target: `entity-${entity.id}`,
        type: 'smoothstep',
        animated: false,
        style: {
          stroke: getEdgeColor(entity.relationship_score),
          strokeWidth: getEdgeWidth(entity.relationship_score),
        },
        label: `关系强度: ${entity.relationship_score}`,
        labelStyle: {
          fontSize: '12px',
          fontWeight: 'bold',
          fill: getEdgeColor(entity.relationship_score),
        },
        labelBgStyle: {
          fill: 'white',
          fillOpacity: 0.8,
        },
      }));
  }, [entities, filteredEntities]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // 当实体或过滤器变化时更新节点和边
  React.useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  React.useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={cn('w-full h-full relative', className)}
    >
      {/* 过滤器控件 */}
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-2">
        <div className="bg-white rounded-lg shadow-lg border p-2 flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">筛选:</span>
          
          {[
            { key: 'all', label: '全部', icon: null },
            { key: 'people', label: '人物', icon: Users },
            { key: 'company', label: '公司', icon: Building },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={cn(
                'px-3 py-1 rounded-md text-sm font-medium transition-all duration-200',
                'flex items-center space-x-1',
                filter === key
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              {Icon && <Icon className="w-3 h-3" />}
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 统计信息 */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-white rounded-lg shadow-lg border p-3">
          <div className="text-sm text-gray-600">
            <div>总实体数: <span className="font-semibold text-gray-900">{entities.length}</span></div>
            <div>当前显示: <span className="font-semibold text-gray-900">{filteredEntities.length}</span></div>
          </div>
        </div>
      </div>

      {/* React Flow 画布 */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{
          padding: 0.2,
          minZoom: 0.3,
          maxZoom: 1.5,
        }}
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: false,
        }}
        className="bg-gray-50"
      >
        <Background color="#e5e7eb" gap={20} size={1} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const entity = (node.data as any)?.entity;
            if (!entity) return '#cbd5e1';
            return entity.tag === 'people' ? '#3b82f6' : '#10b981';
          }}
          nodeStrokeWidth={2}
          nodeBorderRadius={8}
          className="!bg-white !border-gray-200"
        />
      </ReactFlow>

      {/* 帮助提示 */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-white rounded-lg shadow-lg border p-3 max-w-xs">
          <div className="text-xs text-gray-600 space-y-1">
            <div>• 拖拽卡片来重新排列</div>
            <div>• 点击卡片查看详细信息</div>
            <div>• 使用鼠标滚轮缩放画布</div>
            <div>• 连线粗细表示关系强度</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// 辅助函数
function getEdgeColor(score: number): string {
  if (score >= 8) return '#ef4444';
  if (score >= 6) return '#f97316';
  if (score >= 4) return '#eab308';
  return '#6b7280';
}

function getEdgeWidth(score: number): number {
  if (score >= 8) return 4;
  if (score >= 6) return 3;
  if (score >= 4) return 2;
  return 1;
} 