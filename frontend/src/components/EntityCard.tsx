import React, { useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Building2, User, ExternalLink, Calendar } from "lucide-react";
import type { Entity } from "@/types";
import { cn, getEntityTypeColor, getRelationshipScoreColor } from "@/lib/utils";

interface EntityCardProps {
  entity: Entity;
  onEntityClick: (entity: Entity) => void;
  isProtagonist?: boolean;
  className?: string;
}

const tagIcon = {
  people: <User className="w-4 h-4 text-white/80" />,
  company: <Building2 className="w-4 h-4 text-white/80" />,
  event: <Calendar className="w-4 h-4 text-white/80" />,
};

export const EntityCard: React.FC<EntityCardProps> = ({
  entity,
  onEntityClick,
  isProtagonist = false,
  className,
}) => {
  const typeColor = getEntityTypeColor(entity.tag);
  const scoreColor = getRelationshipScoreColor(entity.relationship_score);

  const ref = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    mouseX.set(e.clientX - left - width / 2);
    mouseY.set(e.clientY - top - height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const rotateX = useSpring(useTransform(mouseY, [-100, 100], [-8, 8]), {
    stiffness: 350,
    damping: 40,
  });
  const rotateY = useSpring(useTransform(mouseX, [-100, 100], [8, -8]), {
    stiffness: 350,
    damping: 40,
  });
  const glowX = useSpring(useTransform(mouseX, [-150, 150], [0, 100]), {
    stiffness: 300,
    damping: 30,
  });
  const glowY = useSpring(useTransform(mouseY, [-150, 150], [0, 100]), {
    stiffness: 300,
    damping: 30,
  });

  const getTagDisplayName = () => {
    if (entity.tag === "people") return "人物";
    if (entity.tag === "company") return "公司";
    if (entity.tag === "event") return "事件";
    return "实体";
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onEntityClick(entity)}
      style={{ perspective: "1000px" }}
      className={cn("relative w-64 h-36 transform-style-3d group", className)}
      whileTap={{ scale: 0.97 }}
      layout
    >
      <motion.div
        style={{ rotateX, rotateY }}
        className={cn(
          "absolute inset-0 rounded-xl border",
          "bg-card/60 backdrop-blur-md",
          "shadow-md hover:shadow-xl transition-shadow duration-300",
          isProtagonist
            ? "border-primary/80 shadow-primary/20 hover:shadow-primary/30"
            : "border-border/80 hover:border-border",
        )}
      >
        <motion.div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden"
          style={{
            background: `radial-gradient(circle at ${glowX}% ${glowY}%, hsl(var(--primary) / 0.1), transparent 40%)`,
            mixBlendMode: "soft-light",
          }}
        />
        {isProtagonist && (
          <motion.div className="absolute -inset-1 rounded-xl border-2 border-primary opacity-50 blur-sm animate-pulse" />
        )}
      </motion.div>

      <motion.div
        style={{ rotateX, rotateY }}
        className="absolute inset-0 p-4 flex flex-col justify-between"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                entity.avatar_url ? "bg-card" : typeColor,
              )}
            >
              {entity.avatar_url ? (
                <img
                  src={entity.avatar_url}
                  alt={entity.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                tagIcon[entity.tag]
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-apple-display font-semibold text-card-foreground truncate text-base">
                {entity.name}
              </h3>
              <div className="flex items-center text-xs text-muted-foreground mt-2 font-apple-text">
                <div className="flex items-center gap-1 mr-3">
                  {tagIcon[entity.tag]}
                  <span>{getTagDisplayName()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className={cn("w-2 h-2 rounded-full", scoreColor)} />
                  <span className="text-xs font-semibold">
                    {entity.relationship_score}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {isProtagonist && (
            <div className="text-xs font-apple-text font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
              主角
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2 mt-2 font-apple-text">
          {entity.summary}
        </p>

        {entity.links && entity.links.length > 0 && (
          <a
            href={entity.links[0].url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <ExternalLink className="w-4 h-4 text-muted-foreground/80" />
          </a>
        )}
      </motion.div>
    </motion.div>
  );
};
