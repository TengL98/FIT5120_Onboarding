<template>
  <section class="mb-4 mb-md-5">
    <div class="row g-3 g-md-4">
      <div v-for="item in actions" :key="item.title" class="col-12 col-md-6 col-xl-4">
        <QuickActionCard :title="item.title" :text="item.text" />
      </div>
    </div>
  </section>
</template>

<script setup>
import QuickActionCard from "./QuickActionCard.vue";

const actions = [
  {
    title: "Sunscreen Advice",
    text: "Apply SPF 30+ every 2 hours",
  },
  {
    title: "Clothing Advice",
    text: "Wear protective clothing and a hat",
  },
  {
    title: "Set Reminder",
    text: "Get alerts for peak UV times",
  },
];
</script>
