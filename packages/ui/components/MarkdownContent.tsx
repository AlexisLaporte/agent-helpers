'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownContentProps {
  content: string;
}

// Strip YAML frontmatter from content
function stripFrontmatter(content: string): string {
  // Check if content starts with ---
  if (!content.trimStart().startsWith('---')) {
    return content;
  }

  // Find the closing --- (must be at start of line)
  const lines = content.split('\n');
  let frontmatterEnd = -1;

  // Skip first --- and find the closing one
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      frontmatterEnd = i;
      break;
    }
  }

  // If we found closing ---, return content after it
  if (frontmatterEnd > 0) {
    return lines.slice(frontmatterEnd + 1).join('\n').trimStart();
  }

  // If no closing --- found, return original content
  return content;
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
  const markdownContent = stripFrontmatter(content);

  return (
    <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-code:text-sm prose-pre:bg-gray-900 prose-pre:text-gray-100">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';

            return !inline && language ? (
              <SyntaxHighlighter
                style={oneDark}
                language={language}
                PreTag="div"
                className="rounded-md"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code
                className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            );
          },
          h1({ children }) {
            return (
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-8 mb-4 first:mt-0">
                {children}
              </h1>
            );
          },
          h2({ children }) {
            return (
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                {children}
              </h2>
            );
          },
          h3({ children }) {
            return (
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {children}
              </h3>
            );
          },
          h4({ children }) {
            return (
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mt-4 mb-2">
                {children}
              </h4>
            );
          },
          p({ children }) {
            return <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">{children}</p>;
          },
          ul({ children }) {
            return <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700 dark:text-gray-300">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700 dark:text-gray-300">{children}</ol>;
          },
          li({ children }) {
            return <li className="ml-4">{children}</li>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-blue-500 dark:border-blue-400 pl-4 py-2 my-4 italic text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20">
                {children}
              </blockquote>
            );
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                className="text-blue-600 dark:text-blue-400 hover:underline"
                target={href?.startsWith('http') ? '_blank' : undefined}
                rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                {children}
              </a>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-6">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return <thead className="bg-gray-50 dark:bg-gray-800">{children}</thead>;
          },
          tbody({ children }) {
            return <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">{children}</tbody>;
          },
          tr({ children }) {
            return <tr>{children}</tr>;
          },
          th({ children }) {
            return (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {children}
              </th>
            );
          },
          td({ children }) {
            return <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{children}</td>;
          },
          hr() {
            return <hr className="my-8 border-gray-200 dark:border-gray-700" />;
          },
        }}
      >
        {markdownContent}
      </ReactMarkdown>
    </div>
  );
}
