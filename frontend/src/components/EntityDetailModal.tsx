import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Entity } from "@/types";
import { ModalHeader } from "./ModalHeader";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { SourceList } from "./SourceList";

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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
          >
            <div className="relative bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-white/10 overflow-hidden">
              {/* 装饰性背景渐变 */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-cyan-500/5 pointer-events-none" />
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              
              <ModalHeader entity={entity} onClose={onClose} />

              <div className="flex-1 overflow-y-auto p-6 relative">
                <MarkdownRenderer
                  content={entity.description}
                  links={entity.links}
                />
                <SourceList links={entity.links} />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
