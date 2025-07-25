import React from 'react';
import { X, Building2, User } from 'lucide-react';
import type { Entity } from '@/types';
import { cn, getEntityTypeColor, getRelationshipScoreColor } from '@/lib/utils';

interface ModalHeaderProps {
  entity: Entity;
  onClose: () => void;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({ entity, onClose }) => {
  const typeColor = getEntityTypeColor(entity.tag);
  const scoreColor = getRelationshipScoreColor(entity.relationship_score);

  return (
    <div className="flex items-center justify-between p-6 border-b border-gray-200">
      <div className="flex items-center space-x-4">
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{entity.name}</h1>
          <div className="flex items-center space-x-3">
            <span
              className={cn(
                'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border',
                typeColor
              )}
            >
              {entity.tag === 'people' ? '人物' : entity.tag === 'company' ? '公司' : '事件'}
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

      <button
        onClick={onClose}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <X className="w-6 h-6 text-gray-400" />
      </button>
    </div>
  );
}; 