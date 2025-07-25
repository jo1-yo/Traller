import React, { useState } from 'react';
import { QueryInterface } from './components/QueryInterface';
import { RelationshipCanvas } from './components/RelationshipCanvas';
import { EntityDetailModal } from './components/EntityDetailModal';
import { queryAPI } from './services/api';
import type { Entity, QueryResponse, ApiError } from './types';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {!queryResult ? (
        /* 查询界面 */
        <div className="container mx-auto px-4 py-16">
          <QueryInterface onSubmit={handleQuery} isLoading={isLoading} />
          
          {/* 错误提示 */}
          {error && (
            <div className="mt-8 max-w-4xl mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                  <div className="ml-auto pl-3">
                    <button
                      onClick={() => setError(null)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* 结果展示界面 */
        <div className="h-screen flex flex-col">
          {/* 顶部导航栏 */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">萃流</h1>
              <div className="text-sm text-gray-600">
                查询: <span className="font-medium">{queryResult.originalQuery}</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-500">
                找到 {queryResult.entities.length} 个实体
              </div>
              <button
                onClick={handleNewQuery}
                className="btn-secondary px-4 py-2 text-sm"
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
  );
}

export default App; 