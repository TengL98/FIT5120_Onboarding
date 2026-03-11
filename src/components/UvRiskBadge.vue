<template>
  <span class="risk-badge" :style="{ backgroundColor: color }">{{ label }}</span>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
});
</script>

<style scoped>
.risk-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 0.35rem 0.75rem;
  color: #ffffff;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}
</style>
