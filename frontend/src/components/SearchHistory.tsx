import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { queryAPI } from "../services/api";
import type { SearchHistoryResponse, ApiError } from "../types";
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
      case 'person':
        return 'bg-blue-500';
      case 'company':
        return 'bg-teal-500';
      case 'link':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (!isVisible) {
    return <div ref={observerRef} className="h-20" />;
  }

  return (
    <motion.div
      ref={observerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn('w-full', className)}
    >
      <div className="flex items-center justify-between mb-5 px-2">
        <h2 className="text-base font-medium text-gray-400 font-apple-text tracking-wide">
          Recent Searches
        </h2>
        {historyData && historyData.results.length > 6 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-gray-500 hover:text-white transition-colors font-apple-text"
          >
            {isExpanded ? 'Show Less' : 'Show All'}
          </button>
        )}
      </div>

      {loading && !historyData && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-cyan"></div>
        </div>
      )}

      {error && !historyData && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 text-center text-sm">
          <p className="text-red-400 font-apple-text">{error}</p>
        </div>
      )}

      {historyData && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            {historyData.results
              .slice(0, isExpanded ? undefined : 6)
              .map((item, index) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.05,
                    ease: 'easeOut',
                  }}
                  onClick={() => onSelectHistory(item.id)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/20 transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={cn(
                        'w-1.5 h-6 rounded-full',
                        getQueryTypeColor(item.queryType),
                      )}
                    ></div>
                    <p className="text-base text-gray-200 font-apple-text group-hover:text-white transition-colors">
                      {item.originalQuery}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-gray-500 font-apple-text">
                      {item.entityCount} entities
                    </span>
                    <span className="w-24 text-right text-gray-500 font-apple-text">
                      {formatDate(item.createdAt)}
                    </span>
                    <svg
                      className="w-4 h-4 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
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
      )}

      {isExpanded && hasMore && (
        <div className="mt-4 text-center">
          <button
            onClick={loadMoreHistory}
            disabled={loading}
            className="text-sm text-gray-400 hover:text-white disabled:opacity-50 transition-colors"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </motion.div>
  );
};
