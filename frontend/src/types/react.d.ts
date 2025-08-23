declare namespace JSX {
    interface IntrinsicElements {
        [elemName: string]: any;
    }
}

declare module 'react/jsx-runtime' {
    export default any;
    export const jsx: any;
    export const jsxs: any;
    export const Fragment: any;
}

declare module 'react' {
    export = React;
    export as namespace React;
}

declare module 'react-dom/client' {
    export * from 'react-dom/client';
}
