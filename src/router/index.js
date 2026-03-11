import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import AwarenessView from "../views/AwarenessView.vue";
import PreventionView from "../views/PreventionView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "home", component: HomeView },
    { path: "/awareness", name: "awareness", component: AwarenessView },
    { path: "/prevention", name: "prevention", component: PreventionView },
  ],
});

export default router;
