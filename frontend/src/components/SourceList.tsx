import React from "react";
import { ExternalLink } from "lucide-react";
import type { Entity } from "@/types";

interface SourceListProps {
  links: Entity["links"];
}

export const SourceList: React.FC<SourceListProps> = ({ links }) => {
  if (!links || links.length === 0) return null;

  return (
    <div className="mt-8 border-t border-gray-700/50 pt-6">
      <h3 className="text-lg font-semibold text-white mb-4 font-apple-display flex items-center">
        <div className="w-2 h-2 bg-cyan-500 rounded-full mr-3 animate-pulse"></div>
        信息来源
      </h3>
      <div className="space-y-3">
        {links.map((link) => (
          <div key={link.index} className="flex items-start space-x-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:border-cyan-500/30 transition-all duration-200 group">
            <span className="text-sm text-cyan-400 font-medium mt-1 bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/20">
              [{link.index}]
            </span>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-300 hover:text-cyan-300 hover:underline flex-1 break-all transition-colors duration-200 font-apple-text group-hover:text-cyan-300"
            >
              {link.url}
            </a>
            <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 mt-0.5 flex-shrink-0 transition-colors duration-200" />
          </div>
        ))}
      </div>
    </div>
  );
};
