import React, { useState } from 'react';
import { QueryInterface } from './components/QueryInterface';
import { RelationshipCanvas } from './components/RelationshipCanvas';
import { EntityDetailModal } from './components/EntityDetailModal';
import { queryAPI } from './services/api';
import type { Entity, QueryResponse, ApiError } from './types';
import { cn } from './lib/utils';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [queryResult, setQueryResult] = useState<QueryResponse | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleQuery = async (query: string) => {
    setIsLoading(true);
    setError(null);
    setQueryResult(null);

    try {
      const result = await queryAPI.processQuery({
        query,
        queryType: 'other', // 可以根据查询内容自动判断
      });
      
      setQueryResult(result);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || '查询失败，请重试');
      console.error('Query error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEntityClick = (entity: Entity) => {
    setSelectedEntity(entity);
  };

  const handleCloseModal = () => {
    setSelectedEntity(null);
  };

  const handleNewQuery = () => {
    setQueryResult(null);
    setSelectedEntity(null);
    setError(null);
  };

  return (
    <div className={cn(
      "min-h-screen w-full bg-background transition-colors duration-500",
      "bg-dots" // 添加这个class
    )}>
      <div className="relative z-10 container mx-auto px-4">
        {!queryResult ? (
          /* 查询界面 */
          <div className="container mx-auto flex items-center justify-center min-h-screen">
            <QueryInterface 
              onSubmit={handleQuery} 
              isLoading={isLoading} 
              error={error}
            />
          </div>
        ) : (
          /* 结果展示界面 */
          <div className="h-screen flex flex-col">
            {/* 顶部导航栏 */}
            <div className="bg-card/80 backdrop-blur-sm border-b border-border px-6 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img src="/logo Traller(1).png" alt="Traller Logo" className="w-8 h-8" />
                <h1 className="text-xl font-bold text-foreground">萃流</h1>
                <div className="text-sm text-muted-foreground">
                  查询: <span className="font-medium text-foreground">{queryResult.originalQuery}</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-sm text-muted-foreground">
                  找到 {queryResult.entities.length} 个实体
                </div>
                <button
                  onClick={handleNewQuery}
                  className="px-4 py-2 text-sm rounded-md font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
                >
                  新查询
                </button>
              </div>
            </div>

            {/* 关系画布 */}
            <div className="flex-1">
              <RelationshipCanvas
                entities={queryResult.entities}
                onEntityClick={handleEntityClick}
              />
            </div>
          </div>
        )}

        {/* 实体详情弹窗 */}
        <EntityDetailModal
          entity={selectedEntity}
          isOpen={!!selectedEntity}
          onClose={handleCloseModal}
        />
      </div>
    </div>
  );
}

export default App; 