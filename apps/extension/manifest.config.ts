import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  manifest_version: 3,
  name: "PixelSquire",
  version: "0.1.0",
  description: "Your pixel squire, nudging you to quest daily",
  permissions: ["storage", "alarms", "tabs"],
  host_permissions: ["http://localhost:3000/*"],
  background: {
    service_worker: "src/background/main.ts",
    type: "module",
  },
  content_scripts: [
    {
      matches: ["<all_urls>"],
      js: ["src/content/index.ts"],
      run_at: "document_idle",
    },
  ],
  action: {
    default_popup: "src/popup/index.html",
  },
  web_accessible_resources: [
    {
      resources: ["sprites/*", "fonts/*"],
      matches: ["<all_urls>"],
    },
  ],
});
