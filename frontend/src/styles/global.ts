import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  :root {
    /* Brand — dusty pastel pink / magenta for CTAs */
    --color-brand-50: #fdf2f7;
    --color-brand-100: #fce7f1;
    --color-brand-200: #fbcfe4;
    --color-brand-300: #f9a8cc;
    --color-brand-400: #f078b3;
    --color-brand-500: #d97fa3;
    --color-brand-600: #c45d8a;
    --color-brand-700: #a84874;
    --color-brand-800: #8b3a5f;
    --color-brand-900: #6d2f4c;

    /* Neutrals — ink to newsprint ash */
    --color-gray-50: #fafaf9;
    --color-gray-100: #f5f5f4;
    --color-gray-200: #e7e5e4;
    --color-gray-300: #d6d3d1;
    --color-gray-400: #a8a29e;
    --color-gray-500: #78716c;
    --color-gray-600: #57534e;
    --color-gray-700: #44403c;
    --color-gray-800: #292524;
    --color-gray-900: #1c1917;

    /* Backgrounds — warm paper */
    --color-background-primary: #f0ebe3;
    --color-background-secondary: #e8e2d9;
    --color-background-tertiary: #dcd4c8;

    /* Text */
    --color-text-primary: #1c1917;
    --color-text-secondary: #44403c;
    --color-text-tertiary: #78716c;
    /* Readable on solid pastel CTAs */
    --color-text-inverse: #1c1917;

    /* Borders */
    --color-border-primary: #cfc6ba;
    --color-border-secondary: #b8aea2;
    --color-border-accent: var(--color-brand-500);

    /* Status */
    --color-success: #0d9488;
    --color-warning: #d97706;
    --color-error: #dc2626;
    --color-info: var(--color-brand-600);
  }

  body {
    background-color: var(--color-background-primary);
    color: var(--color-text-primary);
    font-family: 'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, 'Times New Roman', serif;
    line-height: 1.5;
    margin: 0;
    padding: 0;
    min-height: 100vh;
    background-image:
      radial-gradient(ellipse 100% 60% at 50% 0%, rgba(255, 255, 255, 0.55), transparent 55%),
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 3px,
        rgba(28, 25, 23, 0.02) 3px,
        rgba(28, 25, 23, 0.02) 6px
      );
  }

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

  * {
    transition: opacity 0.2s ease;
  }

  *:hover {
    opacity: 1;
  }

  button, a, li, input, select, textarea, [role="button"], [tabindex] {
    opacity: 0.95;
  }

  /* App header logo: beat [role="button"] { opacity: 0.95 } (same element matches both) */
  [role="button"][data-brand-logo="true"] {
    opacity: 1 !important;
  }

  p, h1, h2, h3, h4, h5, h6, label, div, span {
    opacity: 1;
  }

  [data-list-item="true"]:hover {
    background-color: var(--color-background-tertiary) !important;
    transition: background-color 0.2s ease;
  }

  .loading {
    text-align: center;
    padding: 2rem;
    color: var(--color-text-secondary);
  }

  div:contains("Loading") {
    text-align: center;
    padding: 2rem;
    color: var(--color-text-secondary);
  }

  input, select, textarea {
    color: var(--color-text-primary) !important;
  }

  input::placeholder, textarea::placeholder {
    color: var(--color-text-tertiary) !important;
  }

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
