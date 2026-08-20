/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Override the API origin when the backend is not same-origin. */
  readonly VITE_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
