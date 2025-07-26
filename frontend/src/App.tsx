import { useState } from "react";
import { QueryInterface } from "./components/QueryInterface";
import { RelationshipCanvas } from "./components/RelationshipCanvas";
import { EntityDetailModal } from "./components/EntityDetailModal";
import { SearchHistory } from "./components/SearchHistory";
import { queryAPI } from "./services/api";
import type { Entity, QueryResponse, ApiError } from "./types";
import { Toaster } from "sonner";
import { P5Background } from "./components/P5Background";

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
        queryType: "other", // 可以根据查询内容自动判断
      });

      setQueryResult(result);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "查询失败，请重试");
      console.error("Query error:", err);
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

  const handleSelectHistory = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await queryAPI.getQueryById(id);
      setQueryResult(result);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Failed to load historical query");
      console.error("History load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* P5.js 动态背景 */}
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <P5Background />
      </div>

      {/* 内容层 */}
      <div className="relative z-10 container mx-auto px-4">
        {!queryResult ? (
          /* Query interface and search history */
          <div className="container mx-auto">
            {/* Main query interface - centered */}
            <div className="flex flex-col items-center justify-center min-h-screen">
              <QueryInterface
                onSubmit={handleQuery}
                isLoading={isLoading}
                error={error}
              />

              {/* Search history - appears directly below examples */}
              <SearchHistory
                onSelectHistory={handleSelectHistory}
                className="w-full px-4 md:px-6 mt-8"
              />
            </div>
          </div>
        ) : (
          /* 结果展示界面 */
          <div className="h-screen flex flex-col">
            {/* 顶部导航栏 */}
            <div className="bg-black/40 backdrop-blur-md border-b border-white/20 px-4 md:px-6 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-2 md:space-x-4">
                <button
                  onClick={handleNewQuery}
                  className="focus:outline-none transition-opacity hover:opacity-80"
                  aria-label="Go to homepage"
                >
                  <img
                    src="/images/logos/logo Traller(1).png"
                    alt="Traller Logo"
                    className="w-6 h-6 md:w-8 md:h-8"
                  />
                </button>
                <div className="hidden md:block text-sm text-gray-300 font-apple-text">
                  Query:{" "}
                  <span className="font-medium text-white">
                    {queryResult.originalQuery}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="hidden sm:block text-sm text-gray-300 font-apple-text">
                  Found {queryResult.entities.length} entities
                </div>
                <button
                  onClick={handleNewQuery}
                  className="px-3 md:px-4 py-2 text-xs md:text-sm rounded-md font-apple-text text-white bg-gradient-to-r from-brand-light-blue to-brand-cyan hover:opacity-90 transition-opacity"
                >
                  New Query
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
      <Toaster />
    </div>
  );
}

export default App;
