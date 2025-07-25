import React from 'react';
import { motion } from 'framer-motion';
import { Building2, User, ExternalLink } from 'lucide-react';
import type { Entity } from '@/types';
import { cn, getEntityTypeColor, getRelationshipScoreColor } from '@/lib/utils';

interface EntityCardProps {
  entity: Entity;
  onClick: () => void;
  isProtagonist?: boolean;
  className?: string;
}

export const EntityCard: React.FC<EntityCardProps> = ({
  entity,
  onClick,
  isProtagonist = false,
  className,
}) => {
  const typeColor = getEntityTypeColor(entity.tag);
  const scoreColor = getRelationshipScoreColor(entity.relationship_score);

  return (
    <motion.div
      className={cn(
        'relative cursor-pointer group',
        'transition-all duration-300 ease-out',
        'hover:scale-105 hover:z-10',
        className
      )}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      layout
    >
      <div
        className={cn(
          'card p-4 w-64 h-32',
          'border-2 transition-all duration-300',
          'hover:shadow-lg hover:shadow-blue-100',
          isProtagonist
            ? 'border-primary-500 bg-primary-50 shadow-lg'
            : 'border-gray-200 hover:border-primary-300',
          typeColor.includes('blue') && !isProtagonist && 'hover:border-blue-400',
          typeColor.includes('green') && !isProtagonist && 'hover:border-green-400'
        )}
      >
        {/* 关系评分标识 */}
        {!isProtagonist && (
          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-xs font-bold">
            <span className={scoreColor}>{entity.relationship_score}</span>
          </div>
        )}

        {/* 主角标识 */}
        {isProtagonist && (
          <div className="absolute -top-2 -left-2 px-2 py-1 bg-primary-500 text-white text-xs font-medium rounded-full">
            主角
          </div>
        )}

        <div className="flex items-start space-x-3 h-full">
          {/* 头像或图标 */}
          <div className="flex-shrink-0">
            {entity.avatar_url && entity.avatar_url.trim() !== '' ? (
              <img
                src={entity.avatar_url}
                alt={entity.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center',
                typeColor,
                entity.avatar_url && entity.avatar_url.trim() !== '' ? 'hidden' : ''
              )}
            >
              {entity.tag === 'people' ? (
                <User className="w-6 h-6" />
              ) : (
                <Building2 className="w-6 h-6" />
              )}
            </div>
          </div>

          {/* 信息区域 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-gray-900 truncate text-sm">
                {entity.name}
              </h3>
              <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            
            <div className="flex items-center space-x-2 mb-2">
              <span
                className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
                  typeColor
                )}
              >
                {entity.tag === 'people' ? '人物' : '公司'}
              </span>
            </div>

            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
              {entity.summary}
            </p>
          </div>
        </div>

        {/* 悬停提示 */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-5 rounded-lg">
          <span className="text-xs text-gray-700 font-medium">点击查看详情</span>
        </div>
      </div>
    </motion.div>
  );
}; 