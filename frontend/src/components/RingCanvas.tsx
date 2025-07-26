import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import type { Entity } from "@/types";
import { cn } from "@/lib/utils";

interface RingCanvasProps {
  entities: Entity[];
  onEntityClick: (entity: Entity) => void;
  className?: string;
}

interface Card3D {
  entity: Entity;
}

export const RingCanvas: React.FC<RingCanvasProps> = ({
  entities,
  onEntityClick,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const baseAngleRef = useRef(0);
  const cardElementsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [cards, setCards] = useState<Card3D[]>([]);

  // 初始化所有卡片（包括主角）
  useEffect(() => {
    const initialCards: Card3D[] = entities.map((entity) => ({
      entity,
    }));
    setCards(initialCards);
    cardElementsRef.current = new Array(entities.length).fill(null);
  }, [entities]);

  // 3D圆环动画
  const animateRing = useCallback(() => {
    if (!containerRef.current || cards.length === 0) return;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const centerX = containerRect.width / 2;
    const centerY = containerRect.height / 2;
    const radius = Math.min(centerX, centerY) * 0.6;
    const ringWidth = 80;
    const perspective = 800;

    baseAngleRef.current += 0.008;

    cards.forEach((_, i) => {
      const element = cardElementsRef.current[i];
      if (!element) return;

      const n = cards.length;
      const theta = baseAngleRef.current + (i / n) * 2 * Math.PI;
      const bandAngle = Math.sin(theta + baseAngleRef.current) * 0.25;

      // 3D坐标
      const x = radius * Math.cos(theta);
      const y = ringWidth * bandAngle;
      const z = radius * Math.sin(theta);

      // 透视投影
      const scale = perspective / (perspective - z);
      const screenX = centerX + x * scale;
      const screenY = centerY + y * scale;

      // 透明度和层级
      let opacity = 0.25 + (0.75 * (z + radius)) / (2 * radius);
      opacity = Math.max(0.15, Math.min(1, opacity));
      const zIndex = Math.round(1000 + z);

      // 应用样式
      element.style.position = "absolute";
      element.style.left = `${screenX - 55 * scale}px`;
      element.style.top = `${screenY - 75 * scale}px`;
      element.style.transform = `
        scale(${scale})
        skewY(${bandAngle * 15}deg)
      `;
      element.style.opacity = opacity.toString();
      element.style.zIndex = zIndex.toString();
    });

    animationRef.current = requestAnimationFrame(animateRing);
  }, [cards]);

  // 启动动画
  useEffect(() => {
    if (cards.length > 0) {
      animateRing();
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animateRing]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "w-full h-full relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black",
        className,
      )}
      ref={containerRef}
    >
      {/* 背景装饰 - 与画布保持一致 */}

      {/* 3D圆环卡片 - 使用与EntityCard一致的样式 */}
      {cards.map((card, index) => {
        const isProtagonist = card.entity.id === 0;
        return (
          <div
            key={card.entity.id}
            ref={(el) => {
              cardElementsRef.current[index] = el;
            }}
            className={cn(
              "group relative cursor-pointer overflow-hidden rounded-2xl bg-gray-900/80 backdrop-blur-sm shadow-lg transition-all duration-300 ease-out border",
              isProtagonist
                ? "border-primary/50 shadow-primary/20 w-48 h-72"
                : "border-gray-700/60 shadow-black/30 w-40 h-60",
            )}
            onClick={(e) => {
              e.stopPropagation();
              onEntityClick(card.entity);
            }}
          >
            {/* Glow effect */}
            <div
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
            <div className="relative w-full aspect-square overflow-hidden">
              {card.entity.avatar_url ? (
                <img
                  src={card.entity.avatar_url}
                  alt={card.entity.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <span className="text-gray-500 text-2xl font-bold">
                    {card.entity.name.charAt(0)}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
            </div>

            {/* Information Section */}
            <div className="p-4 text-left relative z-10">
              <h3 className="text-lg font-bold text-gray-100 leading-tight mb-1 font-apple-display truncate">
                {card.entity.name}
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 mb-4 font-apple-text">
                {card.entity.summary}
              </p>

              {/* Action Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEntityClick(card.entity);
                }}
                className="relative w-full h-9 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-semibold overflow-hidden transition-all duration-300 ease-out transform hover:scale-105 active:scale-95"
              >
                <span className="relative z-10">LEARN MORE</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/40 to-purple-600/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md" />
              </button>
            </div>
          </div>
        );
      })}

      {/* 使用说明 */}
      <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-md rounded-lg px-4 py-2 text-white text-sm">
        点击卡片查看详情 • 点击空白处重新排列
      </div>
    </motion.div>
  );
};
