import { fileURLToPath, URL } from "node:url";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import federation from "@originjs/vite-plugin-federation";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    federation({
      name: "host-app",
      remotes: {
        webskit: "http://localhost:3344/remoteEntry.js",
      },
      shared: ["vue"],
    }),
    AutoImport({
      imports: [
        "vue",
        "vue-router",
        "@vueuse/head",
        "pinia",
        {
          "@/store": ["useStore"],
        },
      ],
      dts: "src/auto-imports.d.ts",
      eslintrc: {
        enabled: true,
      },
    }),
    Components({
      dirs: ["src/components"],
      extensions: ["vue"],
    }),
    vue(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5183,
  },
});
