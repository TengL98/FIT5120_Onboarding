<template>
  <section class="hero text-center mb-4 mb-md-5" aria-live="polite">
    <h1 class="hero-title">Today's UV</h1>

    <p class="hero-location d-inline-flex align-items-center gap-2">
      <span class="dot" aria-hidden="true"></span>
      <span>{{ locationName }}</span>
    </p>

    <div v-if="loading" class="hero-loading mx-auto"></div>
    <p v-else class="hero-value">{{ Math.round(currentUv) }}</p>

    <p class="hero-category" :style="{ color: uvColor }">{{ uvCategory }}</p>
    <p class="hero-message mb-0">{{ uvShortMessage }}</p>
  </section>
</template>

<script setup>
defineProps({
  locationName: {
    type: String,
    default: "Melbourne, Australia",
  },
  currentUv: {
    type: Number,
    default: 0,
  },
  uvCategory: {
    type: String,
    default: "Low",
  },
  uvShortMessage: {
    type: String,
    default: "Current risk: Low",
  },
  uvColor: {
    type: String,
    default: "#2f9e44",
  },
  loading: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
.hero {
  padding-top: 0.75rem;
}

.hero-title {
  font-weight: 700;
  font-size: clamp(1.5rem, 4.8vw, 2.1rem);
  margin-bottom: 0.5rem;
}

.hero-location {
  color: var(--ss-muted);
  font-weight: 600;
  margin-bottom: 0.65rem;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: linear-gradient(160deg, #3b82f6, #1d4ed8);
}

.hero-value {
  font-size: clamp(4.4rem, 12vw, 7.4rem);
  line-height: 1;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin-bottom: 0.35rem;
  color: #0f172a;
}

.hero-loading {
  width: min(260px, 55vw);
  height: 88px;
  border-radius: 18px;
  margin-bottom: 0.35rem;
  background: linear-gradient(90deg, #edf1f7 25%, #f8fafe 50%, #edf1f7 75%);
  background-size: 200% 100%;
  animation: pulse 1.5s infinite;
}

.hero-category {
  font-size: 1.22rem;
  font-weight: 800;
  margin-bottom: 0.3rem;
}

.hero-message {
  color: var(--ss-muted);
  font-size: 1rem;
  font-weight: 500;
}

@keyframes pulse {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}
</style>
