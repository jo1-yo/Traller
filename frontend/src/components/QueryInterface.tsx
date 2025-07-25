import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QueryInterfaceProps {
  onSubmit: (query: string) => void;
  isLoading: boolean;
  error?: string | null;
  className?: string;
}

export const QueryInterface: React.FC<QueryInterfaceProps> = ({
  onSubmit,
  isLoading,
  error,
  className,
}) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSubmit(query.trim());
    }
  };

  const examples = [
    '马云',
    'Elon Musk',
    '字节跳动',
    'https://www.tesla.com/about',
    '李开复 AI',
  ];

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
  };

  return (
    <div className={cn('w-full max-w-2xl mx-auto px-4 py-8', className)}>
      <motion.div 
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="text-center"
      >
        <motion.div variants={itemVariants} className="flex items-center justify-center mb-4">
          <img src="/logo Traller(1).png" alt="Traller Logo" className="w-24 h-24" />
        </motion.div>

        <motion.h1 variants={itemVariants} className="text-6xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-brand-light-cyan tracking-tight mb-3">
          萃流
        </motion.h1>
        
        <motion.p variants={itemVariants} className="text-lg text-gray-300 mb-12">
          AI驱动的深度人物情报与关系网络探索平台
        </motion.p>
      </motion.div>

      <motion.div
        variants={itemVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.2 }}
      >
        <form onSubmit={handleSubmit} className="input-glow-border">
          <div className="relative flex items-center">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="输入 Elon Musk 试试..."
              className="input"
              disabled={isLoading}
            />
            
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="btn-primary absolute right-2"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isLoading ? 'loading' : 'ready'}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>分析中</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      <span>探索</span>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </form>
      </motion.div>

      <motion.div
        variants={itemVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.3 }}
        className="mt-6"
      >
        <div className="flex flex-wrap justify-center items-center gap-3">
          <span className="text-sm text-gray-400">示例:</span>
          {examples.map((example) => (
            <button
              key={example}
              onClick={() => !isLoading && setQuery(example)}
              disabled={isLoading}
              className="btn-secondary"
            >
              {example}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="mt-8 h-12">
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-center space-x-2 text-gray-400"
            >
              <div className="flex space-x-1">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 bg-brand-cyan rounded-full"
                    animate={{ 
                      y: [0, -4, 0],
                      transition: { duration: 1, repeat: Infinity, delay: i * 0.15 }
                    }}
                  />
                ))}
              </div>
              <span className="text-sm">AI正在深度分析中，请耐心等待... (约需1-2分钟)</span>
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 text-center text-red-300 bg-red-500/20 p-3 rounded-lg"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}; 