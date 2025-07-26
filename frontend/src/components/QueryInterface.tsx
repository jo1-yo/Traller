import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface QueryInterfaceProps {
  onSubmit: (query: string) => void;
  isLoading: boolean;
  error?: string | null;
  className?: string;
}

export const QueryInterface: React.FC<QueryInterfaceProps> = ({
  onSubmit,
  isLoading,
  error,
  className,
}) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSubmit(query.trim());
    }
  };

  const examples = [
    "Elon Musk",
    "OpenAI",
    "Tesla Inc",
    "Mark Zuckerberg",
    "Google DeepMind",
  ];

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <div className={cn("w-full max-w-4xl mx-auto px-4 py-8", className)}>
      {/* Logo in top-left corner */}
      <motion.div
        variants={itemVariants}
        initial="initial"
        animate="animate"
        className="absolute top-8 left-8 z-20"
      >
        <img
          src="/images/logos/logo Traller(1).png"
          alt="Traller Logo"
          className="w-12 h-12 md:w-16 md:h-16"
        />
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="text-center bg-black/10 backdrop-blur-md rounded-3xl p-8 md:p-12 mx-4"
      >
        <motion.div variants={itemVariants} className="mb-8">
          <motion.div className="flex justify-center">
            <motion.img
              src="/images/logos/logo title main-64.png"
              alt="Traller"
              className="h-16 md:h-24 lg:h-32 w-auto object-contain logo-glow"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </motion.div>
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl font-apple-display text-gray-200 mb-4 px-4"
        >
          AI-Powered Intelligence & Relationship Network Explorer
        </motion.p>

        <motion.p
          variants={itemVariants}
          className="text-sm md:text-base font-apple-text text-gray-400 mb-12 md:mb-16 px-4"
        >
          Discover deep insights and complex relationships with advanced AI
          analysis
        </motion.p>
      </motion.div>

      <motion.div
        variants={itemVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.2 }}
      >
        <form onSubmit={handleSubmit} className="input-glow-border">
          <div className="relative flex items-center">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try searching for 'Elon Musk' or 'OpenAI'..."
              className="input"
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="btn-primary absolute right-2"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isLoading ? "loading" : "ready"}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Analyzing</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      <span>Explore</span>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </form>
      </motion.div>

      <motion.div
        variants={itemVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.3 }}
        className="mt-6"
      >
        <div className="flex flex-wrap justify-center items-center gap-2 md:gap-3 px-4">
          <span className="text-sm text-gray-400 font-light mb-2 w-full md:w-auto md:mb-0">
            Examples:
          </span>
          {examples.map((example) => (
            <button
              key={example}
              onClick={() => !isLoading && setQuery(example)}
              disabled={isLoading}
              className="btn-secondary text-xs md:text-sm"
            >
              {example}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="mt-8 h-12">
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-center space-x-2 text-gray-400"
            >
              <div className="flex space-x-1">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 bg-brand-cyan rounded-full"
                    animate={{
                      y: [0, -4, 0],
                      transition: {
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.15,
                      },
                    }}
                  />
                ))}
              </div>
              <span className="text-sm font-light">
                AI is performing deep analysis, please wait... (1-2 minutes)
              </span>
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 text-center text-red-300 bg-red-500/20 p-3 rounded-lg"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
