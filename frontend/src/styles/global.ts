import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  :root {
    /* Brand Colors - Purple Theme */
    --color-brand-50: #8b5cf6;
    --color-brand-100: #4c1d95;
    --color-brand-200: #5b21b6;
    --color-brand-300: #6d28d9;
    --color-brand-400: #7c3aed;
    --color-brand-500: #8b5cf6;
    --color-brand-600: #a78bfa;
    --color-brand-700: #c4b5fd;
    --color-brand-800: #ddd6fe;
    --color-brand-900: #ede9fe;
    
    /* Neutral Colors */
    --color-gray-50: #111827;
    --color-gray-100: #1f2937;
    --color-gray-200: #374151;
    --color-gray-300: #4b5563;
    --color-gray-400: #6b7280;
    --color-gray-500: #9ca3af;
    --color-gray-600: #d1d5db;
    --color-gray-700: #e5e7eb;
    --color-gray-800: #f3f4f6;
    --color-gray-900: #f9fafb;
    
    /* Background Colors */
    --color-background-primary: #0f172a;
    --color-background-secondary: #1e293b;
    --color-background-tertiary: #334155;
    
    /* Text Colors - Lighter Greys */
    --color-text-primary: #f1f5f9;
    --color-text-secondary: #e2e8f0;
    --color-text-tertiary: #cbd5e1;
    --color-text-inverse: #0f172a;
    
    /* Border Colors */
    --color-border-primary: #475569;
    --color-border-secondary: #64748b;
    --color-border-accent: #8b5cf6;
    
    /* Status Colors */
    --color-success: #10b981;
    --color-warning: #f59e0b;
    --color-error: #ef4444;
    --color-info: #8b5cf6;
  }
  
  body {
    background-color: var(--color-background-primary);
    color: var(--color-text-primary);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
    line-height: 1.5;
    margin: 0;
    padding: 0;
  }
  
  /* Typography */
  h1 {
    font-size: 1.875rem;
    font-weight: 600;
    line-height: 2.25rem;
    color: var(--color-text-primary);
    margin: 0 0 1rem 0;
  }
  
  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    line-height: 2rem;
    color: var(--color-text-primary);
    margin: 0 0 0.75rem 0;
  }
  
  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.75rem;
    color: var(--color-text-primary);
    margin: 0 0 0.5rem 0;
  }
  
  p {
    font-size: 1rem;
    line-height: 1.5;
    color: var(--color-text-secondary);
    margin: 0 0 1rem 0;
  }
  
  /* Global hover styles */
  * {
    transition: opacity 0.2s ease;
  }
  
  *:hover {
    opacity: 1;
  }
  
  /* Make interactive elements slightly transparent by default */
  button, a, li, input, select, textarea, [role="button"], [tabindex] {
    opacity: 0.9;
  }
  
  /* Ensure text and non-interactive elements remain readable */
  p, h1, h2, h3, h4, h5, h6, label, div, span {
    opacity: 1;
  }
  
  /* Global list item hover styles */
  [data-list-item="true"]:hover {
    background-color: var(--color-background-tertiary) !important;
    transition: background-color 0.2s ease;
  }
  
  /* Global loading text styles */
  .loading {
    text-align: center;
    padding: 2rem;
    color: var(--color-text-secondary);
  }
  
  /* Center any div that contains "Loading" text */
  div:contains("Loading") {
    text-align: center;
    padding: 2rem;
    color: var(--color-text-secondary);
  }
  
  /* Global input styles */
  input, select, textarea {
    color: var(--color-text-primary) !important;
  }
  
  input::placeholder, textarea::placeholder {
    color: var(--color-text-tertiary) !important;
  }
  
  /* Global container styles */
  
  
  .container-content {
    max-width: 600px;
    margin: 0 auto;
  }
  
  .container-wide {
    width: 100%;
  }
  
  .container-wide-content {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 1rem;
  }
`;