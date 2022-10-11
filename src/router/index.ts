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
      component: () => import("../core/ComponentRender.vue"),
    },
  ],
});

export default router;
