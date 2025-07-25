import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { ExternalLink } from 'lucide-react';
import type { Entity } from '@/types';

interface MarkdownRendererProps {
  content: string;
  links: Entity['links'];
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, links }) => {
  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          a: ({ href, children, ...props }) => {
            const isReference = /^\[\d+\]$/.test(children?.toString() || '');
            if (isReference && href) {
              const index = parseInt(children?.toString().replace(/[\[\]]/g, '') || '0');
              const link = links.find(l => l.index === index);
              return (
                <a
                  href={link?.url || href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-medium mx-1"
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
                className="text-blue-600 hover:text-blue-800"
                {...props}
              >
                {children}
              </a>
            );
          },
          h1: ({ children, ...props }) => <h1 className="text-xl font-bold text-gray-900 mt-6 mb-4" {...props}>{children}</h1>,
          h2: ({ children, ...props }) => <h2 className="text-lg font-semibold text-gray-800 mt-5 mb-3" {...props}>{children}</h2>,
          h3: ({ children, ...props }) => <h3 className="text-base font-medium text-gray-700 mt-4 mb-2" {...props}>{children}</h3>,
          p: ({ children, ...props }) => <p className="text-gray-600 leading-relaxed mb-3" {...props}>{children}</p>,
          ul: ({ children, ...props }) => <ul className="list-disc list-inside text-gray-600 space-y-1 mb-4" {...props}>{children}</ul>,
          ol: ({ children, ...props }) => <ol className="list-decimal list-inside text-gray-600 space-y-1 mb-4" {...props}>{children}</ol>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}; 