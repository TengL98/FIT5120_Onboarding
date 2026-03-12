<template>
  <div>
    <div class="risk-track" role="img" aria-label="UV risk scale">
      <span class="risk-marker" :style="{ left: `${position}%` }" aria-hidden="true"></span>
    </div>
    <div class="risk-labels mt-2">
      <span v-for="label in labels" :key="label">{{ label }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { getUvScalePosition } from "../composables/useUvRules";

const props = defineProps({
  currentUv: {
    type: Number,
    default: 0,
  },
});

const labels = ["Low", "Moderate", "High", "Very High", "Extreme"];
const position = computed(() => getUvScalePosition(props.currentUv));
</script>

<style scoped>
.risk-track {
  position: relative;
  height: 12px;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    #2f9e44 0%,
    #e3b400 30%,
    #f08c00 55%,
    #f7675f 78%,
    #c92a2a 100%
  );
}

.risk-marker {
  position: absolute;
  top: 50%;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ffffff;
  border: 3px solid #172034;
  transform: translate(-50%, -50%);
  box-shadow: 0 4px 12px rgba(23, 32, 52, 0.28);
}

.risk-labels {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.5rem;
}

.risk-labels span {
  font-size: 0.78rem;
  text-align: center;
  color: var(--ss-muted);
  font-weight: 600;
}
</style>
