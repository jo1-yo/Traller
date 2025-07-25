import React from 'react';
import { ExternalLink } from 'lucide-react';
import type { Entity } from '@/types';

interface SourceListProps {
  links: Entity['links'];
}

export const SourceList: React.FC<SourceListProps> = ({ links }) => {
  if (!links || links.length === 0) return null;

  return (
    <div className="mt-8 border-t border-gray-200 pt-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">信息来源</h3>
      <div className="space-y-2">
        {links.map((link) => (
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
  );
}; 