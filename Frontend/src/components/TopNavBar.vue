<template>
  <header class="top-nav sticky-top">
    <div class="container-xl py-3 d-flex flex-wrap align-items-center justify-content-between gap-2">
      <RouterLink to="/" class="brand text-decoration-none d-inline-flex align-items-center gap-2">
        <span class="logo-mark" aria-hidden="true"></span>
        <span class="brand-text">SolarSense</span>
      </RouterLink>

      <nav aria-label="Main navigation" class="d-flex align-items-center gap-2">
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-pill text-decoration-none"
          :class="{ active: isActive(item.path) }"
        >
          {{ item.label }}
        </RouterLink>
        <button type="button" class="logout-btn" @click="handleSignOut">Sign out</button>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { useRoute } from "vue-router";
import { signOut } from "aws-amplify/auth";

const route = useRoute();

const navItems = [
  { path: "/", label: "Home" },
  { path: "/awareness", label: "Awareness" },
  { path: "/prevention", label: "Prevention" },
];

const isActive = (path) => route.path === path;

const handleSignOut = async () => {
  try {
    await signOut({ global: false });
  } catch (error) {
    console.error("Failed to sign out", error);
  }
};
</script>

<style scoped>
.top-nav {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--ss-border);
}

.logo-mark {
  width: 24px;
  height: 24px;
  border-radius: 8px;
  background: linear-gradient(160deg, #ffbf00, #ff7b39 50%, #ef4444);
  box-shadow: 0 8px 14px rgba(239, 68, 68, 0.25);
}

.brand-text {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--ss-text);
  letter-spacing: -0.01em;
}

.nav-pill {
  color: var(--ss-muted);
  font-weight: 600;
  font-size: 0.95rem;
  padding: 0.45rem 1rem;
  border-radius: 999px;
  transition: all 0.22s ease;
  outline-offset: 3px;
}

.nav-pill:hover,
.nav-pill:focus-visible {
  color: var(--ss-text);
  background: #ebeff5;
}

.nav-pill.active {
  color: #ffffff;
  background: #172034;
}

.logout-btn {
  border: 1px solid #d2dae6;
  background: #fff;
  color: #172034;
  font-size: 0.9rem;
  font-weight: 700;
  border-radius: 999px;
  padding: 0.4rem 0.9rem;
  transition: all 0.2s ease;
}

.logout-btn:hover,
.logout-btn:focus-visible {
  border-color: #172034;
  background: #eef2f7;
}

.user-label {
  font-size: 0.85rem;
  color: var(--ss-muted);
  font-weight: 700;
  padding: 0 0.25rem;
}

@media (max-width: 575px) {
  .brand {
    width: 100%;
  }

  nav {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
