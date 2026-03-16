<template>
  <header class="top-nav sticky-top">
    <div class="container-xl py-3 d-flex flex-wrap align-items-center justify-content-between gap-2">
      <RouterLink to="/" class="brand text-decoration-none d-inline-flex align-items-center gap-2">
        <span class="logo-mark" aria-hidden="true"></span>
        <span class="brand-text">SunSense</span>
      </RouterLink>

      <nav aria-label="Main navigation" class="top-nav-menu d-flex align-items-center gap-2">
        <div class="top-nav-links">
          <RouterLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="nav-pill text-decoration-none"
            :class="{ active: isActive(item.path) }"
          >
            {{ item.label }}
          </RouterLink>
        </div>
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--ss-muted);
  font-weight: 600;
  font-size: 0.95rem;
  padding: 0.45rem 1rem;
  min-height: 2.5rem;
  border-radius: 999px;
  transition: all 0.22s ease;
  outline-offset: 3px;
  white-space: nowrap;
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #d2dae6;
  background: #fff;
  color: #172034;
  font-size: 0.9rem;
  font-weight: 700;
  border-radius: 999px;
  padding: 0.4rem 0.9rem;
  min-height: 2.5rem;
  transition: all 0.2s ease;
  white-space: nowrap;
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

  .top-nav-menu {
    width: 100%;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .top-nav-links {
    display: flex;
    gap: 0.35rem;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    padding-bottom: 2px;
    flex: 1 1 auto;
  }

  .top-nav-links::-webkit-scrollbar {
    display: none;
  }

  .nav-pill,
  .logout-btn {
    min-height: 44px;
  }

  .nav-pill {
    padding: 0.45rem 0.8rem;
  }
}
</style>
