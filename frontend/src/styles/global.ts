import { createGlobalStyle } from "styled-components";
import { theme } from "./theme";

export const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: ${theme.typography.fontFamily};
    font-size: ${theme.typography.fontSize.md};
    line-height: 1.5;
    color: ${theme.colors.dark};
    background-color: ${theme.colors.light};
  }

  h1, h2, h3, h4, h5, h6 {
    margin: 0 0 ${theme.spacing.md} 0;
    font-weight: 600;
    line-height: 1.2;
  }

  h1 { font-size: ${theme.typography.fontSize.xl}; }
  h2 { font-size: ${theme.typography.fontSize.lg}; }
  h3 { font-size: ${theme.typography.fontSize.md}; }

  p {
    margin: 0 0 ${theme.spacing.md} 0;
  }

  a {
    color: ${theme.colors.primary};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }

  button {
    font-family: inherit;
  }

  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
  }

  .error {
    color: ${theme.colors.danger};
    font-size: ${theme.typography.fontSize.sm};
    margin-top: ${theme.spacing.xs};
  }
`;