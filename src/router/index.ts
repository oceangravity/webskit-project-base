import {useCounterStore} from "@/stores/counter";
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "main",
      component: () => import("../views/Main.vue"),
      redirect: "/home",
      children: [],
    },
    {
      path: "/render",
      name: "render",
      component: () => import("../views/Render.vue"),
    },
  ],
});

export default router;
