import { marked } from 'marked';
import DOMPurify from 'dompurify';
import React from 'react';

/**
 * Configure marked options
 * GitHub Flavored Markdown (tables, strikethrough, etc.) is enabled by default
 */
marked.setOptions({
    breaks: true, // Convert line breaks to <br>
    gfm: true, // GitHub Flavored Markdown (tables, strikethrough, etc.)
});

/**
 * Parse markdown string and sanitize HTML output
 * @param markdown - The markdown string to parse
 * @returns Sanitized HTML string safe for rendering
 */
export const parseMarkdown = (markdown: string): string => {
    // Parse markdown to HTML using marked's synchronous parse method
    const html = marked.parse(markdown) as string;

    // Sanitize the HTML to prevent XSS attacks
    // This removes dangerous tags and attributes while keeping safe formatting
    const sanitized = DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
            'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li',
            'blockquote',
            'a',
            'table', 'thead', 'tbody', 'tr', 'th', 'td'
        ],
        ALLOWED_ATTR: ['href', 'title', 'alt'],
        ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    });

    return sanitized;
};

/**
 * React component that renders markdown safely
 * @param markdown - The markdown string to render
 * @param className - Optional CSS class name
 */
export const MarkdownRenderer: React.FC<{ markdown: string; className?: string }> = ({
    markdown,
    className
}) => {
    const html = parseMarkdown(markdown);

    return (
        <div
            className={className}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
};

