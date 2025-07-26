import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { ExternalLink } from "lucide-react";
import type { Entity } from "@/types";

interface MarkdownRendererProps {
  content: string;
  links: Entity["links"];
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  links,
}) => {
  return (
    <div className="prose prose-sm max-w-none prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          a: ({ href, children, ...props }) => {
            const isReference = /^\[\d+\]$/.test(children?.toString() || "");
            if (isReference && href) {
              const index = parseInt(
                children?.toString().replace(/[\[\]]/g, "") || "0",
              );
              const link = links.find((l) => l.index === index);
              return (
                <a
                  href={link?.url || href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 font-medium mx-1 transition-colors duration-200 bg-cyan-500/10 px-2 py-1 rounded-md border border-cyan-500/20"
                  title={link?.url}
                  {...props}
                >
                  <span>{children}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              );
            }
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 transition-colors duration-200 underline decoration-cyan-500/50 hover:decoration-cyan-300"
                {...props}
              >
                {children}
              </a>
            );
          },
          h1: ({ children, ...props }) => (
            <h1
              className="text-xl font-bold text-white mt-6 mb-4 font-apple-display bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
              {...props}
            >
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2
              className="text-lg font-semibold text-gray-200 mt-5 mb-3 font-apple-display border-l-2 border-cyan-500/50 pl-3"
              {...props}
            >
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3
              className="text-base font-medium text-gray-300 mt-4 mb-2 font-apple-text"
              {...props}
            >
              {children}
            </h3>
          ),
          p: ({ children, ...props }) => (
            <p className="text-gray-300 leading-relaxed mb-4 font-apple-text" {...props}>
              {children}
            </p>
          ),
          ul: ({ children, ...props }) => (
            <ul
              className="list-disc list-inside text-gray-300 space-y-2 mb-4 font-apple-text ml-4"
              {...props}
            >
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol
              className="list-decimal list-inside text-gray-300 space-y-2 mb-4 font-apple-text ml-4"
              {...props}
            >
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className="text-gray-300 leading-relaxed" {...props}>
              {children}
            </li>
          ),
          blockquote: ({ children, ...props }) => (
            <blockquote
              className="border-l-4 border-cyan-500/50 pl-4 py-2 my-4 bg-cyan-500/5 rounded-r-lg text-gray-300 italic"
              {...props}
            >
              {children}
            </blockquote>
          ),
          code: ({ children, ...props }) => (
            <code
              className="bg-gray-800/50 text-cyan-300 px-2 py-1 rounded text-sm font-mono border border-gray-700/50"
              {...props}
            >
              {children}
            </code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
