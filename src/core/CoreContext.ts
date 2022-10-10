import type { App } from "vue";
import Core from "@/core/Core";
export default {
  install: (app: App) => {
    app.config.globalProperties.$Core = typeof Core;
  },
};
