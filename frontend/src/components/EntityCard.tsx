import React from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import type { Entity } from "@/types";
import { cn } from "@/lib/utils";

interface EntityCardProps {
  entity: Entity;
  onEntityClick: (entity: Entity) => void;
  isProtagonist?: boolean;
}

export const EntityCard: React.FC<EntityCardProps> = ({
  entity,
  onEntityClick,
  isProtagonist = false,
}) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "group relative w-full min-w-[280px] max-w-[400px] h-auto cursor-pointer overflow-hidden rounded-3xl bg-gray-900 shadow-lg transition-all duration-300 ease-out",
        "border-2",
        isProtagonist
          ? "border-primary/60 shadow-primary/20"
          : "border-gray-700/80 shadow-black/30",
      )}
      onClick={() => onEntityClick(entity)}
      style={{ perspective: "1000px" }}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: isProtagonist
            ? "radial-gradient(circle at 50% 0%, hsl(var(--primary) / 0.15), transparent 70%)"
            : "radial-gradient(circle at 50% 0%, hsl(var(--secondary) / 0.1), transparent 70%)",
        }}
      />
      
      {isProtagonist && (
        <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full z-10">
          PROTAGONIST
        </div>
      )}

      {/* Main Image Section */}
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        {entity.avatar_url ? (
          <img
            src={entity.avatar_url}
            alt={entity.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <span className="text-gray-500 text-2xl font-bold">
              {entity.name.charAt(0)}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
      </div>

      {/* Information Section */}
      <div className="p-6 text-left relative z-10">
        <h3 className="text-2xl font-extrabold text-gray-100 leading-tight mb-3 font-apple-display">
          {entity.name}
        </h3>
        <p className="text-sm text-gray-400 leading-relaxed line-clamp-2 mb-6 font-apple-text">
          {entity.summary}
        </p>

        {/* Action Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEntityClick(entity);
          }}
          className="relative w-full h-11 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold overflow-hidden transition-all duration-300 ease-out transform hover:scale-105 active:scale-95"
        >
          <span className="relative z-10">LEARN MORE</span>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/40 to-purple-600/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md" />
        </button>
      </div>
      
      {entity.links && entity.links.length > 0 && (
        <a
          href={entity.links[0].url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors duration-300 z-10 p-2 bg-black/30 rounded-full"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      )}
    </motion.div>
  );
};
