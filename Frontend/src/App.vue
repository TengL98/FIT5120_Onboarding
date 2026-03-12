<template>
  <div class="app-shell">
    <TopNavBar />
    <main class="page-wrap py-4 py-md-5">
      <div class="container-xl">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import TopNavBar from "./components/TopNavBar.vue";
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap");

:root {
  --ss-bg: #f3f5f8;
  --ss-card-bg: #ffffff;
  --ss-text: #152238;
  --ss-muted: #6e7787;
  --ss-border: #e6ebf2;
  --ss-shadow: 0 16px 38px rgba(19, 33, 59, 0.08);
  --ss-radius-xl: 30px;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: "Manrope", "Segoe UI", sans-serif;
  background: radial-gradient(circle at 10% -10%, #ffffff 0, #f6f8fb 50%, #edf1f6 100%);
  color: var(--ss-text);
  min-height: 100vh;
}

#app,
.app-shell {
  min-height: 100vh;
}

.page-wrap {
  position: relative;
}

.soft-card {
  background: var(--ss-card-bg);
  border: 1px solid rgba(19, 33, 59, 0.04);
  border-radius: var(--ss-radius-xl);
  box-shadow: var(--ss-shadow);
}

.section-heading {
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

@media (max-width: 767px) {
  :root {
    --ss-radius-xl: 24px;
  }
}
</style>
