import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface HelpViewerProps {
  content: string;
  className?: string;
  onTopicChange?: (topic: string) => void; // Callback when user clicks an internal help link
}

const HelpViewer: React.FC<HelpViewerProps> = ({ content, className = '', onTopicChange }) => {
  return (
    <div className={`help-viewer prose prose-lg max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom image component with proper styling and error handling
          img: ({ node, ...props }) => {
            // Handle both absolute paths (/help/images/...) and relative paths
            const src = props.src || '';
            const alt = props.alt || '';
            
            return (
              <div className="my-6 flex justify-center">
                <img
                  {...props}
                  src={src}
                  alt={alt}
                  className="max-w-full h-auto rounded-lg shadow-md border border-gray-200"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    console.warn(`Help image failed to load: ${src}`);
                  }}
                />
              </div>
            );
          },
          
          // Custom heading components with anchor links
          h1: ({ node, ...props }) => (
            <h1 
              {...props} 
              className="text-3xl font-bold text-gray-900 mt-8 mb-4 pb-2 border-b border-gray-200"
            />
          ),
          h2: ({ node, ...props }) => (
            <h2 
              {...props} 
              className="text-2xl font-semibold text-gray-800 mt-6 mb-3"
            />
          ),
          h3: ({ node, ...props }) => (
            <h3 
              {...props} 
              className="text-xl font-semibold text-gray-700 mt-5 mb-2"
            />
          ),
          h4: ({ node, ...props }) => (
            <h4 
              {...props} 
              className="text-lg font-medium text-gray-700 mt-4 mb-2"
            />
          ),
          
          // Custom paragraph styling
          p: ({ node, ...props }) => (
            <p {...props} className="text-gray-700 mb-4 leading-relaxed" />
          ),
          
          // Custom list styling
          ul: ({ node, ...props }) => (
            <ul {...props} className="list-disc list-inside mb-4 space-y-2 text-gray-700" />
          ),
          ol: ({ node, ...props }) => (
            <ol {...props} className="list-decimal list-inside mb-4 space-y-2 text-gray-700" />
          ),
          li: ({ node, ...props }) => (
            <li {...props} className="ml-4 mb-1" />
          ),
          
          // Custom link styling - intercept internal help file links
          a: ({ node, ...props }) => {
            const href = props.href || '';
            const isExternal = href.startsWith('http://') || href.startsWith('https://');
            
            // Check if this is an internal help file link (starts with ./ and ends with .md)
            const isInternalHelpLink = href.startsWith('./') && href.endsWith('.md');
            
            const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
              if (isInternalHelpLink && onTopicChange) {
                e.preventDefault();
                // Extract filename from path (e.g., ./helpfile01_create-request.md -> helpfile01_create-request)
                const filename = href.replace('./', '').replace('.md', '');
                console.log('Internal help link clicked:', href, '-> topic:', filename);
                onTopicChange(filename);
              }
              // External links and non-help links work normally
            };
            
            return (
              <a
                {...props}
                href={href}
                onClick={handleClick}
                className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
              />
            );
          },
          
          // Custom code block with syntax highlighting
          code: ({ node, inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            
            return !inline && language ? (
              <div className="my-4">
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={language}
                  PreTag="div"
                  className="rounded-lg"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code
                className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            );
          },
          
          // Custom blockquote styling
          blockquote: ({ node, ...props }) => (
            <blockquote
              {...props}
              className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-4"
            />
          ),
          
          // Custom table styling
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6">
              <table
                {...props}
                className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-lg"
              />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead {...props} className="bg-gray-50" />
          ),
          tbody: ({ node, ...props }) => (
            <tbody {...props} className="bg-white divide-y divide-gray-200" />
          ),
          tr: ({ node, ...props }) => (
            <tr {...props} className="hover:bg-gray-50" />
          ),
          th: ({ node, ...props }) => (
            <th
              {...props}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            />
          ),
          td: ({ node, ...props }) => (
            <td {...props} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700" />
          ),
          
          // Custom horizontal rule
          hr: ({ node, ...props }) => (
            <hr {...props} className="my-8 border-t border-gray-300" />
          ),
          
          // Custom strong/bold styling
          strong: ({ node, ...props }) => (
            <strong {...props} className="font-semibold text-gray-900" />
          ),
          
          // Custom emphasis/italic styling
          em: ({ node, ...props }) => (
            <em {...props} className="italic text-gray-700" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default HelpViewer;

