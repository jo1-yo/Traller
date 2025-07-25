import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { queryAPI } from "../services/api";
import type {
  SearchHistoryItem,
  SearchHistoryResponse,
  ApiError,
} from "../types";
import { cn } from "../lib/utils";

interface SearchHistoryProps {
  onSelectHistory: (id: string) => void;
  className?: string;
}

export const SearchHistory: React.FC<SearchHistoryProps> = ({
  onSelectHistory,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [historyData, setHistoryData] = useState<SearchHistoryResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          loadInitialHistory();
        }
      },
      { threshold: 0.1, rootMargin: "100px" },
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const loadInitialHistory = async () => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await queryAPI.getSearchHistory(1, 6);
      setHistoryData(response);
      setHasMore(response.pagination.totalPages > 1);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Failed to load search history");
    } finally {
      setLoading(false);
    }
  };

  const loadMoreHistory = async () => {
    if (loading || !hasMore || !historyData) return;

    setLoading(true);

    try {
      const nextPage = page + 1;
      const response = await queryAPI.getSearchHistory(nextPage, 6);

      setHistoryData((prev) => ({
        ...response,
        results: [...(prev?.results || []), ...response.results],
      }));

      setPage(nextPage);
      setHasMore(nextPage < response.pagination.totalPages);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Failed to load more history");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const getQueryTypeDisplay = (type: string) => {
    switch (type) {
      case "person":
        return "Person";
      case "company":
        return "Company";
      case "link":
        return "Link";
      default:
        return "General";
    }
  };

  const getQueryTypeColor = (type: string) => {
    switch (type) {
      case "person":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "company":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "link":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  if (!isVisible) {
    return <div ref={observerRef} className="h-8" />;
  }

  return (
    <motion.div
      ref={observerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn("w-full max-w-4xl mx-auto mt-4 mb-6", className)}
    >
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 rounded-md bg-gradient-to-r from-brand-light-blue to-brand-cyan flex items-center justify-center">
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white font-apple-text">
            Recent Searches
          </h3>
          {historyData && (
            <span className="text-xs text-gray-400 font-apple-text">
              {historyData.pagination.totalItems} queries
            </span>
          )}
        </div>

        {historyData && historyData.results.length > 2 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-400 hover:text-white transition-colors font-apple-text"
          >
            <span>{isExpanded ? "Show Less" : "Show All"}</span>
            <motion.svg
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </motion.svg>
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading && !historyData && (
        <div className="flex items-center justify-center py-6">
          <div className="flex items-center space-x-2 text-gray-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-cyan"></div>
            <span className="text-sm font-apple-text">
              Loading search history...
            </span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !historyData && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3 text-center">
          <p className="text-red-300 text-sm font-apple-text">{error}</p>
          <button
            onClick={loadInitialHistory}
            className="mt-1 text-xs text-red-400 hover:text-red-300 transition-colors font-apple-text"
          >
            Try Again
          </button>
        </div>
      )}

      {/* History List - Horizontal Strips */}
      {historyData && historyData.results.length > 0 && (
        <div className="space-y-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={isExpanded ? "expanded" : "collapsed"}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="space-y-2"
            >
              {historyData.results
                .slice(0, isExpanded ? undefined : 2)
                .map((item, index) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.05,
                      ease: "easeOut",
                    }}
                    onClick={() => onSelectHistory(item.id)}
                    className="group w-full bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-3 text-left hover:border-brand-cyan/40 hover:bg-black/30 transition-all duration-300 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <span
                        className={cn(
                          "inline-flex px-2 py-1 text-xs font-medium rounded border font-apple-text flex-shrink-0",
                          getQueryTypeColor(item.queryType),
                        )}
                      >
                        {getQueryTypeDisplay(item.queryType)}
                      </span>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium text-sm truncate font-apple-text group-hover:text-brand-cyan transition-colors">
                          {item.originalQuery}
                        </h4>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-xs text-gray-400 font-apple-text">
                            {item.entityCount} entities found
                          </span>
                          <span className="text-xs text-gray-500 font-apple-text">
                            {formatDate(item.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </motion.button>
                ))}
            </motion.div>
          </AnimatePresence>

          {/* Load More Button */}
          {isExpanded && hasMore && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center mt-4"
            >
              <button
                onClick={loadMoreHistory}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-black/20 backdrop-blur-sm border border-white/15 rounded-md text-gray-400 hover:text-white hover:border-brand-cyan/40 transition-all duration-300 disabled:opacity-50 font-apple-text text-sm"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-brand-cyan"></div>
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <span>Load More</span>
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </>
                )}
              </button>
            </motion.div>
          )}
        </div>
      )}

      {/* Empty State */}
      {historyData && historyData.results.length === 0 && (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-500/20 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h4 className="text-base font-medium text-gray-300 mb-1 font-apple-text">
            No Search History
          </h4>
          <p className="text-sm text-gray-400 font-apple-text">
            Your search queries will appear here once you start exploring.
          </p>
        </div>
      )}
    </motion.div>
  );
};
