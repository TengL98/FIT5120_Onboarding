<template>
  <section class="mb-4 mb-md-5">
    <div class="row g-3 g-md-4">
      <div v-for="item in actions" :key="item.title" class="col-12 col-md-6 col-xl-4">
        <QuickActionCard :title="item.title" :text="item.text" @click="goToPrevention(item.targetId)" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { useRouter } from "vue-router";
import QuickActionCard from "./QuickActionCard.vue";

const router = useRouter();

function goToPrevention(targetId) {
  router.push({
    name: "prevention",
    hash: `#${targetId}`,
    query: { focus: targetId },
  });
}

const actions = [
  {
    title: "Sunscreen Advice",
    text: "Apply SPF 30+ every 2 hours",
    targetId: "sunscreen-guide",
  },
  {
    title: "Clothing Advice",
    text: "Wear protective clothing and a hat",
    targetId: "protection-gear",
  },
  {
    title: "Set Reminder",
    text: "Get alerts for peak UV times",
    targetId: "suncare-timer",
  },
];
</script>
