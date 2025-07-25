import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QueryInterfaceProps {
  onSubmit: (query: string) => void;
  isLoading: boolean;
  className?: string;
}

export const QueryInterface: React.FC<QueryInterfaceProps> = ({
  onSubmit,
  isLoading,
  className,
}) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSubmit(query.trim());
    }
  };

  return (
    <div className={cn('w-full max-w-4xl mx-auto', className)}>
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center mb-4"
        >
          <Sparkles className="w-8 h-8 text-primary-500 mr-2" />
          <h1 className="text-4xl font-bold text-gray-900">萃流</h1>
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-lg text-gray-600 mb-2"
        >
          人物智能探索系统
        </motion.p>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-sm text-gray-500"
        >
          AI驱动的深度人物情报与关系网络探索平台
        </motion.p>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        onSubmit={handleSubmit}
        className="relative"
      >
        <div className="relative flex items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="输入人物姓名、公司、链接或任何相关信息..."
            className={cn(
              'input w-full pr-32 py-4 text-base',
              'border-2 border-gray-200 focus:border-primary-400',
              'shadow-lg hover:shadow-xl transition-all duration-300',
              isLoading && 'opacity-70'
            )}
            disabled={isLoading}
          />
          
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className={cn(
              'absolute right-2 btn-primary px-6 py-2',
              'transition-all duration-300 transform',
              'hover:scale-105 active:scale-95',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
            )}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>分析中...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4" />
                <span>探索</span>
              </div>
            )}
          </button>
        </div>
      </motion.form>

      {/* 示例查询 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-6"
      >
        <p className="text-sm text-gray-500 mb-3 text-center">试试这些示例：</p>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            '马云',
            'Elon Musk',
            '字节跳动',
            'https://www.tesla.com/about',
            '李开复 AI',
          ].map((example) => (
            <button
              key={example}
              onClick={() => !isLoading && setQuery(example)}
              disabled={isLoading}
              className={cn(
                'px-3 py-1 text-sm rounded-full border border-gray-300',
                'hover:border-primary-400 hover:bg-primary-50 hover:text-primary-700',
                'transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {example}
            </button>
          ))}
        </div>
      </motion.div>

      {/* 加载状态指示器 */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center space-x-2 text-gray-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>AI正在深度分析，请耐心等待...</span>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            这个过程可能需要1-2分钟，我们正在搜集和分析相关信息
          </div>
        </motion.div>
      )}
    </div>
  );
}; 