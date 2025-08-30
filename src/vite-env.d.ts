/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_UPLOAD_URL: string;
  readonly VITE_ENVIRONMENT: string;
  readonly VITE_ENABLE_DEBUG: string;
  readonly VITE_ENABLE_PERFORMANCE_LOGGING: string;
  // Add other environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}