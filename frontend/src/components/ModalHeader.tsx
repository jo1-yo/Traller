import React from "react";
import { X, Building2, User } from "lucide-react";
import type { Entity } from "@/types";
import { cn, getEntityTypeColor, getRelationshipScoreColor } from "@/lib/utils";

interface ModalHeaderProps {
  entity: Entity;
  onClose: () => void;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  entity,
  onClose,
}) => {
  const typeColor = getEntityTypeColor(entity.tag);
  const scoreColor = getRelationshipScoreColor(entity.relationship_score);

  return (
    <div className="relative flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm">
      {/* 装饰性光晕 */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none" />
      
      <div className="flex items-center space-x-4 relative z-10">
        <div className="flex-shrink-0 relative">
          {entity.avatar_url && entity.avatar_url.trim() !== "" ? (
            <div className="relative">
              <img
                src={entity.avatar_url}
                alt={entity.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-white/20 shadow-xl"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextElementSibling?.classList.remove("hidden");
                }}
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 pointer-events-none" />
            </div>
          ) : null}
          <div
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center border-2 border-white/20 shadow-xl relative overflow-hidden",
              "bg-gradient-to-br from-gray-700 to-gray-800",
              entity.avatar_url && entity.avatar_url.trim() !== ""
                ? "hidden"
                : "",
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
            {entity.tag === "person" ? (
              <User className="w-8 h-8 text-white/80 relative z-10" />
            ) : (
              <Building2 className="w-8 h-8 text-white/80 relative z-10" />
            )}
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-white mb-2 font-apple-display">
            {entity.name}
          </h1>
          <div className="flex items-center space-x-3">
            <span
              className={cn(
                "inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border backdrop-blur-sm",
                "bg-white/10 border-white/20 text-white/90"
              )}
            >
              {entity.tag === "person"
                ? "人物"
                : entity.tag === "company"
                  ? "公司"
                  : "事件"}
            </span>
            {entity.id !== 0 && (
              <div className="flex items-center space-x-1">
                <span className="text-sm text-gray-300 font-apple-text">关系紧密度:</span>
                <span className={cn("font-bold text-sm", "text-cyan-400")}>
                  {entity.relationship_score}/10
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={onClose}
        className="relative p-2 hover:bg-white/10 rounded-lg transition-all duration-200 group z-10"
      >
        <X className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-red-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    </div>
  );
};
