import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  :root {
    --color-brand-50: blue;
  }
  body {
    background-color: cream;
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
`;