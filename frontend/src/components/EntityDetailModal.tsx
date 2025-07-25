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
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", duration: 0.3 }}
          >
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
              <ModalHeader entity={entity} onClose={onClose} />

              <div className="flex-1 overflow-y-auto p-6">
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
