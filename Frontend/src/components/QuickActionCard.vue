<template>
  <button class="action-card text-start" type="button">
    <p class="action-title mb-2">{{ title }}</p>
    <p class="action-text mb-0">{{ text }}</p>
  </button>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
});
</script>

<style scoped>
.action-card {
  width: 100%;
  border: 1px solid rgba(21, 34, 56, 0.08);
  border-radius: 22px;
  padding: 1.2rem 1.15rem;
  background: #ffffff;
  color: inherit;
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
  box-shadow: 0 8px 20px rgba(19, 33, 59, 0.05);
  outline-offset: 3px;
}

.action-card:hover,
.action-card:focus-visible {
  transform: translateY(-4px);
  border-color: rgba(33, 74, 138, 0.3);
  box-shadow: 0 16px 34px rgba(19, 33, 59, 0.12);
}

.action-title {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

.action-text {
  color: var(--ss-muted);
  font-size: 0.93rem;
  line-height: 1.5;
}
</style>
