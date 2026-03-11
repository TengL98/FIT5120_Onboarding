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

  // Stop redirect loop when Cognito returns an OAuth error and surface it in console for diagnosis.
  if (hasOAuthError(to)) {
    const error = String(to.query.error ?? "");
    const errorDescription = String(to.query.error_description ?? "");
    const state = String(to.query.state ?? "");

    console.error(
      `[Cognito OAuth error] error=${error}; description=${errorDescription}; state=${state}; fullPath=${to.fullPath}`,
    );

    // Block protected route access when OAuth callback fails.
    return false;
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
