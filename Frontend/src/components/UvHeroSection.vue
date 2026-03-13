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
});

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
  margin-bottom: 0.65rem;
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
  margin-bottom: 0.35rem;
  color: #0f172a;
}

.hero-loading {
  width: min(260px, 55vw);
  height: 88px;
  border-radius: 18px;
  margin-bottom: 0.35rem;
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
}

@media (prefers-reduced-motion: reduce) {
  .hero-glow,
  .hero-light,
  .hero-loading {
    animation: none;
  }
}
</style>
