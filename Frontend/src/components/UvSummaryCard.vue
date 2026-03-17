<template>
  <section class="soft-card p-4 p-md-5 mb-4 mb-md-5">
    <div v-if="loading" class="summary-loading"></div>

    <template v-else>
      <div class="row g-4 align-items-center mb-4">
        <div class="col-12 col-lg-7">
          <p class="eyebrow mb-2">TODAY'S UV · {{ locationName }}</p>

          <div class="d-flex flex-wrap align-items-end gap-3 mb-3">
            <p class="summary-uv mb-0">{{ Math.round(currentUv) }}</p>
            <div class="pb-2">
              <UvRiskBadge :label="uvCategory" :color="uvColor" />
              <p class="text-muted mt-2 mb-0 small fw-semibold">UV Index</p>
            </div>
          </div>

          <p class="summary-advice mb-0">{{ uvLongAdvice }}</p>
        </div>

        <div class="col-12 col-lg-5">
          <div class="meta-grid">
            <div>
              <p class="meta-label mb-1">Day</p>
              <p class="meta-value">{{ weekday }}</p>
            </div>
            <div>
              <p class="meta-label mb-1">Date</p>
              <p class="meta-value">{{ todayDate }}</p>
            </div>
            <div>
              <p class="meta-label mb-1">Peak Window</p>
              <p class="meta-value">{{ peakWindowText }}</p>
            </div>
          </div>
        </div>
      </div>

      <UvRiskScale :current-uv="currentUv" />
    </template>
  </section>
</template>

<script setup>
import UvRiskBadge from "./UvRiskBadge.vue";
import UvRiskScale from "./UvRiskScale.vue";

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
  uvLongAdvice: {
    type: String,
    default: "Enjoy your day outside.",
  },
  uvColor: {
    type: String,
    default: "#2f9e44",
  },
  weekday: {
    type: String,
    default: "Monday",
  },
  todayDate: {
    type: String,
    default: "January 1, 2026",
  },
  peakWindowText: {
    type: String,
    default: "11:00 - 14:00",
  },
  safeWindowText: {
    type: String,
    default: "Before 09:00",
  },
  loading: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
.eyebrow {
  color: #667085;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.13em;
}

.summary-uv {
  font-size: clamp(3rem, 8vw, 4.8rem);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.03em;
}

.summary-advice {
  color: #334155;
  max-width: 58ch;
  font-size: 1rem;
  line-height: 1.65;
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.meta-label {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--ss-muted);
}

.meta-value {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  color: #1f2937;
}

.summary-loading {
  width: 100%;
  height: 230px;
  border-radius: 20px;
  background: linear-gradient(90deg, #edf1f7 25%, #f9fbff 50%, #edf1f7 75%);
  background-size: 200% 100%;
  animation: pulse 1.5s infinite;
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
