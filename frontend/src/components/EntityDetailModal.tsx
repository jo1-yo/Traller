import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, User, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import type { Entity } from '@/types';
import { cn, getEntityTypeColor, getRelationshipScoreColor } from '@/lib/utils';

interface EntityDetailModalProps {
  entity: Entity | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EntityDetailModal: React.FC<EntityDetailModalProps> = ({
  entity,
  isOpen,
  onClose,
}) => {
  if (!entity) return null;

  const typeColor = getEntityTypeColor(entity.tag);
  const scoreColor = getRelationshipScoreColor(entity.relationship_score);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* 弹窗内容 */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', duration: 0.3 }}
          >
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
              {/* 头部 */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-4">
                                     {/* 头像 */}
                   <div className="flex-shrink-0">
                     {entity.avatar_url && entity.avatar_url.trim() !== '' ? (
                       <img
                         src={entity.avatar_url}
                         alt={entity.name}
                         className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                         onError={(e) => {
                           e.currentTarget.style.display = 'none';
                           e.currentTarget.nextElementSibling?.classList.remove('hidden');
                         }}
                       />
                     ) : null}
                     <div
                       className={cn(
                         'w-16 h-16 rounded-full flex items-center justify-center border-4 border-white shadow-lg',
                         typeColor,
                         entity.avatar_url && entity.avatar_url.trim() !== '' ? 'hidden' : ''
                       )}
                     >
                      {entity.tag === 'people' ? (
                        <User className="w-8 h-8" />
                      ) : (
                        <Building2 className="w-8 h-8" />
                      )}
                    </div>
                  </div>

                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {entity.name}
                    </h1>
                    <div className="flex items-center space-x-3">
                      <span
                        className={cn(
                          'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border',
                          typeColor
                        )}
                      >
                        {entity.tag === 'people' ? '人物' : '公司'}
                      </span>
                      {entity.id !== 0 && (
                        <div className="flex items-center space-x-1">
                          <span className="text-sm text-gray-500">关系紧密度:</span>
                          <span className={cn('font-bold text-sm', scoreColor)}>
                            {entity.relationship_score}/10
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 关闭按钮 */}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              {/* 内容区域 */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkBreaks]}
                    components={{
                      // 自定义链接渲染，处理引用
                      a: ({ href, children, ...props }) => {
                        // 检查是否是引用链接（如 [1], [2]）
                        const isReference = /^\[\d+\]$/.test(children?.toString() || '');
                        
                        if (isReference && href) {
                          const index = parseInt(children?.toString().replace(/[\[\]]/g, '') || '0');
                          const link = entity.links.find(l => l.index === index);
                          
                          return (
                            <a
                              href={link?.url || href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-medium mx-1"
                              title={link?.url}
                              {...props}
                            >
                              <span>{children}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          );
                        }
                        
                        return (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                            {...props}
                          >
                            {children}
                          </a>
                        );
                      },
                      
                      // 自定义标题样式
                      h1: ({ children, ...props }) => (
                        <h1 className="text-xl font-bold text-gray-900 mt-6 mb-4" {...props}>
                          {children}
                        </h1>
                      ),
                      h2: ({ children, ...props }) => (
                        <h2 className="text-lg font-semibold text-gray-800 mt-5 mb-3" {...props}>
                          {children}
                        </h2>
                      ),
                      h3: ({ children, ...props }) => (
                        <h3 className="text-base font-medium text-gray-700 mt-4 mb-2" {...props}>
                          {children}
                        </h3>
                      ),
                      
                      // 自定义段落样式
                      p: ({ children, ...props }) => (
                        <p className="text-gray-600 leading-relaxed mb-3" {...props}>
                          {children}
                        </p>
                      ),
                      
                      // 自定义列表样式
                      ul: ({ children, ...props }) => (
                        <ul className="list-disc list-inside text-gray-600 space-y-1 mb-4" {...props}>
                          {children}
                        </ul>
                      ),
                      ol: ({ children, ...props }) => (
                        <ol className="list-decimal list-inside text-gray-600 space-y-1 mb-4" {...props}>
                          {children}
                        </ol>
                      ),
                    }}
                  >
                    {entity.description}
                  </ReactMarkdown>
                </div>

                {/* 信息来源 */}
                {entity.links && entity.links.length > 0 && (
                  <div className="mt-8 border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">信息来源</h3>
                    <div className="space-y-2">
                      {entity.links.map((link) => (
                        <div key={link.index} className="flex items-start space-x-2">
                          <span className="text-sm text-gray-500 font-medium mt-1">
                            [{link.index}]
                          </span>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex-1 break-all"
                          >
                            {link.url}
                          </a>
                          <ExternalLink className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}; 