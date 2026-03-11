import { createRouter, createWebHistory } from "vue-router";
import { getCurrentUser, signInWithRedirect } from "aws-amplify/auth";
import HomeView from "../views/HomeView.vue";
import AwarenessView from "../views/AwarenessView.vue";
import PreventionView from "../views/PreventionView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "home", component: HomeView, meta: { requiresAuth: true } },
    {
      path: "/awareness",
      name: "awareness",
      component: AwarenessView,
      meta: { requiresAuth: true },
    },
    {
      path: "/prevention",
      name: "prevention",
      component: PreventionView,
      meta: { requiresAuth: true },
    },
  ],
});

const hasOAuthCode = (to) => typeof to.query.code === "string" && typeof to.query.state === "string";
const hasOAuthError = (to) => typeof to.query.error === "string";

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) {
    return true;
  }

  // If Cognito returns an OAuth error in query params, clear them first to avoid redirect URL growth.
  if (hasOAuthError(to)) {
    return { path: to.path, query: {}, hash: to.hash };
  }

  if (hasOAuthCode(to)) {
    return true;
  }

  try {
    await getCurrentUser();
    return true;
  } catch {
    await signInWithRedirect({ customState: to.path });
    return false;
  }
});

export default router;
