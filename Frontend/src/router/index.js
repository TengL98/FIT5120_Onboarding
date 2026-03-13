import { createRouter, createWebHistory } from "vue-router";
import { getCurrentUser, signInWithRedirect } from "aws-amplify/auth";
import HomeView from "../views/HomeView.vue";
import AwarenessView from "../views/AwarenessView.vue";
import PreventionView from "../views/PreventionView.vue";

const POST_LOGIN_PATH_KEY = "ss.postLoginPath";

function savePostLoginPath(path) {
  try {
    window.sessionStorage.setItem(POST_LOGIN_PATH_KEY, path);
  } catch {
    // Ignore storage errors (private mode / blocked storage).
  }
}

function consumePostLoginPath() {
  try {
    const savedPath = window.sessionStorage.getItem(POST_LOGIN_PATH_KEY);
    window.sessionStorage.removeItem(POST_LOGIN_PATH_KEY);
    return savedPath;
  } catch {
    return null;
  }
}

function peekPostLoginPath() {
  try {
    return window.sessionStorage.getItem(POST_LOGIN_PATH_KEY);
  } catch {
    return null;
  }
}

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

const sleep = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

async function hasAuthenticatedUser(maxRetries = 6, retryDelayMs = 220) {
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      await getCurrentUser();
      return true;
    } catch {
      if (attempt === maxRetries) {
        return false;
      }
      await sleep(retryDelayMs);
    }
  }

  return false;
}

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
    // Let Amplify's OAuth listener finish code exchange first.
    return true;
  }

  const authed = await hasAuthenticatedUser();

  if (authed) {

    const postLoginPath = peekPostLoginPath();
    if (postLoginPath && to.path === "/" && postLoginPath !== to.fullPath) {
      consumePostLoginPath();
      return postLoginPath;
    }

    if (postLoginPath && postLoginPath === to.fullPath) {
      consumePostLoginPath();
    }

    return true;
  }

  savePostLoginPath(to.fullPath);
  await signInWithRedirect({ customState: to.path });
  return false;
});

export default router;
