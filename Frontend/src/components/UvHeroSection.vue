<template>
  <section
    class="hero text-center mb-4 mb-md-5"
    :class="`hero--${uvTheme.key}`"
    :style="uvTheme.vars"
    aria-live="polite"
  >
    <div class="hero-gradient" aria-hidden="true"></div>
    <div class="hero-glow hero-glow-a" aria-hidden="true"></div>
    <div class="hero-glow hero-glow-b" aria-hidden="true"></div>
    <div class="hero-light" aria-hidden="true"></div>

    <div class="hero-panel">
      <h1 class="hero-title">Today's UV</h1>

      <p class="hero-location d-inline-flex align-items-center gap-2">
        <span class="dot" aria-hidden="true"></span>
        <span>{{ locationName }}</span>
      </p>

      <div class="hero-search-wrap" role="search" aria-label="Location search">
        <label for="heroSearch" class="visually-hidden">Search suburb</label>
        <div class="hero-search-field">
          <span class="hero-search-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8" />
              <path d="M16 16L21 21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </span>
          <input
            id="heroSearch"
            :value="searchQuery"
            class="hero-search-input"
            type="text"
            placeholder="Search suburb"
            autocomplete="off"
            @input="emit('update:search-query', $event.target.value)"
            @focus="emit('open-suggestions')"
            @blur="emit('close-suggestions')"
          />
        </div>

        <ul
          v-if="showSuggestions"
          class="hero-suggestion-list list-unstyled mb-0"
          role="listbox"
          aria-label="Location suggestions"
        >
          <li v-for="location in searchSuggestions" :key="location.id">
            <button
              class="hero-suggestion-item"
              type="button"
              @mousedown.prevent="emit('select-location', location)"
            >
              {{ location.name }}
            </button>
          </li>
        </ul>

        <div class="hero-search-meta">
          <button class="hero-location-action" type="button" @click="emit('use-current-location')">
            Use current location
          </button>
          <span class="hero-location-source">
            {{ locationMode === "live" ? "Live" : "Manual" }}
          </span>
        </div>

        <p v-if="searchLoading" class="hero-search-status mb-0">Searching locations...</p>
        <p v-else-if="searchError" class="hero-search-status mb-0">{{ searchError }}</p>
      </div>

      <div v-if="loading" class="hero-loading mx-auto"></div>
      <p v-else class="hero-value">{{ Math.round(currentUv) }}</p>

      <p class="hero-category" :style="{ color: uvColor }">{{ uvCategory }}</p>
      <p class="hero-message mb-0">{{ uvShortMessage }}</p>
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
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
  searchQuery: {
    type: String,
    default: "",
  },
  searchSuggestions: {
    type: Array,
    default: () => [],
  },
  showSuggestions: {
    type: Boolean,
    default: false,
  },
  searchLoading: {
    type: Boolean,
    default: false,
  },
  searchError: {
    type: String,
    default: "",
  },
  locationMode: {
    type: String,
    default: "live",
  },
});

const emit = defineEmits([
  "update:search-query",
  "open-suggestions",
  "close-suggestions",
  "use-current-location",
  "select-location",
]);

const UV_THEME_BY_LEVEL = {
  low: {
    grad1: "#d9fbe4",
    grad2: "#b6f0d1",
    grad3: "#e8fff1",
    highlight: "rgba(236, 255, 247, 0.92)",
    glowA: "rgba(153, 233, 180, 0.55)",
    glowB: "rgba(128, 219, 177, 0.46)",
    dotStart: "#4dd4ac",
    dotEnd: "#2b9b74",
  },
  moderate: {
    grad1: "#fff4c8",
    grad2: "#ffe8a0",
    grad3: "#fff8de",
    highlight: "rgba(255, 250, 219, 0.94)",
    glowA: "rgba(255, 221, 130, 0.54)",
    glowB: "rgba(255, 202, 120, 0.46)",
    dotStart: "#f6bf47",
    dotEnd: "#db9f22",
  },
  high: {
    grad1: "#ffe2bd",
    grad2: "#ffc58f",
    grad3: "#fff1df",
    highlight: "rgba(255, 233, 201, 0.94)",
    glowA: "rgba(255, 171, 100, 0.56)",
    glowB: "rgba(255, 147, 95, 0.46)",
    dotStart: "#ff9b54",
    dotEnd: "#db6e24",
  },
  "very-high": {
    grad1: "#ffd5bf",
    grad2: "#ffb08c",
    grad3: "#ffe8dc",
    highlight: "rgba(255, 218, 195, 0.95)",
    glowA: "rgba(255, 131, 93, 0.57)",
    glowB: "rgba(244, 114, 74, 0.47)",
    dotStart: "#ff815f",
    dotEnd: "#e4552e",
  },
  extreme: {
    grad1: "#ffc6be",
    grad2: "#ff8d86",
    grad3: "#ffe0e1",
    highlight: "rgba(255, 205, 198, 0.95)",
    glowA: "rgba(234, 88, 91, 0.58)",
    glowB: "rgba(219, 72, 109, 0.48)",
    dotStart: "#ef5f66",
    dotEnd: "#c83659",
  },
};

function getThemeKey(uv) {
  if (uv <= 2) return "low";
  if (uv <= 5) return "moderate";
  if (uv <= 7) return "high";
  if (uv <= 10) return "very-high";
  return "extreme";
}

const uvTheme = computed(() => {
  const key = getThemeKey(Number(props.currentUv) || 0);
  const palette = UV_THEME_BY_LEVEL[key];

  return {
    key,
    vars: {
      "--hero-grad-1": palette.grad1,
      "--hero-grad-2": palette.grad2,
      "--hero-grad-3": palette.grad3,
      "--hero-grad-highlight": palette.highlight,
      "--hero-glow-a": palette.glowA,
      "--hero-glow-b": palette.glowB,
      "--hero-dot-start": palette.dotStart,
      "--hero-dot-end": palette.dotEnd,
    },
  };
});
</script>

<style scoped>
.hero {
  --hero-grad-1: #d9fbe4;
  --hero-grad-2: #b6f0d1;
  --hero-grad-3: #e8fff1;
  --hero-grad-highlight: rgba(236, 255, 247, 0.92);
  --hero-glow-a: rgba(153, 233, 180, 0.55);
  --hero-glow-b: rgba(128, 219, 177, 0.46);
  --hero-dot-start: #4dd4ac;
  --hero-dot-end: #2b9b74;
  position: relative;
  isolation: isolate;
  overflow: hidden;
  border-radius: 30px;
  padding: 1rem 1rem 1.1rem;
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
}

.hero-gradient,
.hero-glow,
.hero-light {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hero-gradient {
  z-index: 0;
  background:
    radial-gradient(circle at 16% 14%, var(--hero-grad-highlight) 0, transparent 52%),
    linear-gradient(140deg, var(--hero-grad-1) 0%, var(--hero-grad-2) 50%, var(--hero-grad-3) 100%);
}

.hero-glow {
  z-index: 1;
  border-radius: 999px;
  filter: blur(46px);
  animation: floatGlow 18s ease-in-out infinite;
}

.hero-glow-a {
  inset: auto auto -24% -12%;
  width: 48%;
  height: 68%;
  background: radial-gradient(circle at 35% 40%, var(--hero-glow-a), transparent 70%);
}

.hero-glow-b {
  inset: -35% -10% auto auto;
  width: 50%;
  height: 76%;
  background: radial-gradient(circle at 40% 45%, var(--hero-glow-b), transparent 70%);
  animation-delay: -8s;
}

.hero-light {
  z-index: 1;
  opacity: 0.5;
  background:
    radial-gradient(70% 45% at 50% 5%, rgba(255, 255, 255, 0.66), transparent 100%),
    radial-gradient(50% 40% at 78% 72%, rgba(255, 255, 255, 0.28), transparent 100%);
  animation: glowPulse 16s ease-in-out infinite;
}

.hero-panel {
  position: relative;
  z-index: 2;
  margin: 0 auto;
  max-width: 640px;
  padding: 1.1rem 1rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.38);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.24);
  backdrop-filter: blur(14px) saturate(130%);
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.14);
}

.hero-title {
  font-weight: 700;
  font-size: clamp(1.5rem, 4.8vw, 2.1rem);
  margin-bottom: 0.5rem;
  color: #0f172a;
}

.hero-location {
  color: rgba(30, 41, 59, 0.82);
  font-weight: 600;
  margin-bottom: 0.7rem;
}

.hero-search-wrap {
  position: relative;
  width: min(470px, 100%);
  margin: 0 auto 0.7rem;
  text-align: left;
}

.hero-search-field {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.52);
  background: rgba(255, 255, 255, 0.36);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(12px) saturate(130%);
  padding: 0.42rem 0.85rem;
}

.hero-search-icon {
  width: 17px;
  height: 17px;
  color: rgba(15, 23, 42, 0.52);
  flex: 0 0 auto;
}

.hero-search-icon svg {
  width: 100%;
  height: 100%;
}

.hero-search-input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #0f172a;
  font-size: 0.95rem;
  font-weight: 500;
  padding: 0.12rem 0;
}

.hero-search-input::placeholder {
  color: rgba(30, 41, 59, 0.56);
}

.hero-suggestion-list {
  position: absolute;
  z-index: 20;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  max-height: 220px;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.16);
}

.hero-suggestion-item {
  width: 100%;
  text-align: left;
  border: 0;
  background: transparent;
  padding: 0.58rem 0.82rem;
  color: #1e293b;
  font-size: 0.92rem;
}

.hero-suggestion-item:hover {
  background: rgba(248, 250, 252, 0.96);
}

.hero-search-meta {
  margin-top: 0.48rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
}

.hero-location-action {
  border: 0;
  background: transparent;
  padding: 0;
  color: rgba(15, 23, 42, 0.74);
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.hero-location-action:hover {
  color: rgba(15, 23, 42, 0.95);
}

.hero-location-source {
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(30, 41, 59, 0.58);
}

.hero-search-status {
  margin-top: 0.18rem;
  font-size: 0.79rem;
  color: rgba(30, 41, 59, 0.72);
  min-height: 1rem;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: linear-gradient(160deg, var(--hero-dot-start), var(--hero-dot-end));
}

.hero-value {
  font-size: clamp(4.4rem, 12vw, 7.4rem);
  line-height: 1;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin-bottom: 0.28rem;
  color: #0f172a;
}

.hero-loading {
  width: min(260px, 55vw);
  height: 88px;
  border-radius: 18px;
  margin-bottom: 0.28rem;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.5) 25%, rgba(255, 255, 255, 0.82) 50%, rgba(255, 255, 255, 0.5) 75%);
  background-size: 200% 100%;
  animation: pulse 1.5s infinite;
}

.hero-category {
  font-size: 1.22rem;
  font-weight: 800;
  margin-bottom: 0.3rem;
}

.hero-message {
  color: rgba(30, 41, 59, 0.76);
  font-size: 1rem;
  font-weight: 500;
}

@keyframes floatGlow {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }

  50% {
    transform: translate3d(2%, -2%, 0) scale(1.04);
  }
}

@keyframes glowPulse {
  0%,
  100% {
    opacity: 0.46;
  }

  50% {
    opacity: 0.62;
  }
}

@keyframes pulse {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

@media (max-width: 576px) {
  .hero {
    border-radius: 24px;
    padding: 0.8rem;
  }

  .hero-panel {
    border-radius: 20px;
    padding: 0.95rem 0.85rem 0.85rem;
  }

  .hero-search-wrap {
    margin-bottom: 0.55rem;
  }

  .hero-search-field {
    padding: 0.4rem 0.75rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-glow,
  .hero-light,
  .hero-loading {
    animation: none;
  }
}
</style>
