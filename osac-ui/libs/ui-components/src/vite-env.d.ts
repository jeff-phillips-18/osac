/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** When `true`, catalog hooks use local mock catalog items and resource lookups. */
  readonly VITE_MOCK_CATALOG_DATA?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.png' {
  const src: string;
  export default src;
}
