<template>
  <section class="soft-card p-4 p-md-5 mb-4 mb-md-5">
    <div class="d-flex align-items-center justify-content-between mb-3 mb-md-4">
      <h2 class="section-heading mb-0">Daily UV Trend</h2>
      <p class="chart-note mb-0">06:00 - 20:00</p>
    </div>

    <div v-if="loading" class="chart-loading"></div>
    <UvTrendChart v-else :times="times" :values="values" />
  </section>
</template>

<script setup>
import UvTrendChart from "./UvTrendChart.vue";

defineProps({
  times: {
    type: Array,
    default: () => [],
  },
  values: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
.chart-note {
  color: var(--ss-muted);
  font-size: 0.86rem;
  font-weight: 600;
}

.chart-loading {
  width: 100%;
  height: 320px;
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
