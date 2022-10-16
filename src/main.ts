import { createApp } from "vue";
import { createPinia } from "pinia";
import "./assets/style.css";
import App from "./App.vue";
import router from "./router";
import { useCounterStore } from "@/stores/counter";
import { ComponentRender } from "webskit-core";

const pinia = createPinia()
const app = createApp(App);
app.use(router);
app.use(pinia);
app.component('ComponentRender', ComponentRender)
app.mount("body");

