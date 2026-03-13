<template>
  <section class="awareness-page" :class="{ 'awareness-page--ready': pageReady }" aria-label="Awareness dashboard">
    <div class="awareness-glow awareness-glow-a" aria-hidden="true"></div>
    <div class="awareness-glow awareness-glow-b" aria-hidden="true"></div>

    <article class="soft-card awareness-card awareness-card--first p-3 p-md-4 mb-4">
      <header class="mb-3 mb-md-4 d-flex flex-wrap align-items-start justify-content-between gap-2">
        <div>
          <h1 class="section-heading mb-1">Skin Cancer Impact Trends</h1>
          <p class="chart-subtitle mb-0">Annual male, female and person rates in Australia</p>
        </div>
        <span class="chart-kicker">Annual series</span>
      </header>

      <div class="chart-scroll" aria-label="Skin cancer impact trends chart scroll container">
        <div ref="mortalityChartRef" class="chart-canvas"></div>
      </div>
    </article>

    <article class="soft-card awareness-card awareness-card--second p-3 p-md-4">
      <header class="mb-3 mb-md-4 d-flex flex-wrap align-items-start justify-content-between gap-2">
        <div>
          <h2 class="section-heading mb-1">Historical UV Trend</h2>
          <p class="chart-subtitle mb-0">Monthly UV index trend from backend awareness data</p>
        </div>
        <span class="chart-kicker">Monthly UV series</span>
      </header>

      <div class="chart-scroll" aria-label="Historical UV trend chart scroll container">
        <div ref="tempUvChartRef" class="chart-canvas"></div>
      </div>
    </article>
  </section>
</template>

<script setup>
import * as echarts from "echarts";
import { onBeforeUnmount, onMounted, ref } from "vue";

const mortalityChartRef = ref(null);
const tempUvChartRef = ref(null);
const pageReady = ref(false);

let mortalityChart = null;
let tempUvChart = null;

const mscColor = "#ef8f34";
const nmscColor = "#2fa65a";
const uvColor = "#4f73d9";
const AWARENESS_API_URL =
  "https://dpak8q4na5.execute-api.ap-southeast-2.amazonaws.com/dev_visual/awareness/visualizations";

const awarenessData = ref({
  skinCancerImpact: [],
  uvTrend: [],
});

function toNumberArray(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  return values.map((value) => Number(value || 0));
}

function normalizeVisualizationsPayload(payload) {
  const skinCancerImpact = payload?.skinCancerImpact || {};
  const uvTrend = payload?.uvTrend || {};

  const years = Array.isArray(skinCancerImpact.years) ? skinCancerImpact.years : [];
  const femaleRates = toNumberArray(skinCancerImpact.female_rate);
  const maleRates = toNumberArray(skinCancerImpact.male_rate);
  const personRates = toNumberArray(skinCancerImpact.person_rate);

  const skinCancerRows = years.map((year, index) => ({
    year,
    maleRate: maleRates[index] ?? 0,
    femaleRate: femaleRates[index] ?? 0,
    personRate: personRates[index] ?? 0,
  }));

  const yearMonth = Array.isArray(uvTrend.year_month) ? uvTrend.year_month : [];
  const uvIndex = toNumberArray(uvTrend.uv_index);

  const uvTrendRows = yearMonth.map((label, index) => ({
    yearMonth: label,
    uvIndex: uvIndex[index] ?? 0,
  }));

  return {
    skinCancerImpact: skinCancerRows,
    uvTrend: uvTrendRows,
  };
}

async function loadAwarenessVisualizations() {
  const response = await fetch(AWARENESS_API_URL, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Awareness visualizations request failed with status ${response.status}.`);
  }

  const payload = await response.json();
  awarenessData.value = normalizeVisualizationsPayload(payload);
}

function mortalityTooltipFormatter(params) {
  if (!params.length) {
    return "";
  }

  const row = awarenessData.value.skinCancerImpact[params[0].dataIndex];
  if (!row) {
    return "";
  }

  return [
    `<div style="font-weight:700;margin-bottom:6px;">Year: ${row.year}</div>`,
    `<div style="font-weight:700;color:${mscColor};margin-bottom:2px;">Male rate</div>`,
    `<div style="margin-bottom:4px;">${row.maleRate.toFixed(2)}</div>`,
    `<div style="font-weight:700;color:${nmscColor};margin-bottom:2px;">Female rate</div>`,
    `<div style="margin-bottom:4px;">${row.femaleRate.toFixed(2)}</div>`,
    `<div style="font-weight:700;color:${uvColor};margin-bottom:2px;">Person rate</div>`,
    `<div>${row.personRate.toFixed(2)}</div>`,
  ].join("");
}

function initMortalityChart() {
  if (!mortalityChartRef.value) {
    return;
  }

  mortalityChart = echarts.init(mortalityChartRef.value, null, { renderer: "canvas" });

  mortalityChart.setOption({
    animationDuration: 850,
    animationEasing: "cubicOut",
    color: [mscColor, nmscColor, uvColor],
    grid: { left: 56, right: 36, top: 36, bottom: 88 },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "line",
        lineStyle: { color: "rgba(60, 73, 94, 0.24)", width: 1.4 },
      },
      backgroundColor: "rgba(255,255,255,0.92)",
      borderColor: "rgba(19,33,59,0.09)",
      borderWidth: 1,
      textStyle: { color: "#1f2a3d", fontFamily: "Manrope, Segoe UI, sans-serif" },
      extraCssText: "backdrop-filter: blur(8px); box-shadow: 0 14px 34px rgba(19,33,59,.14); border-radius: 14px;",
      formatter: mortalityTooltipFormatter,
    },
    legend: {
      top: 0,
      left: "center",
      icon: "roundRect",
      itemWidth: 14,
      itemHeight: 6,
      textStyle: { color: "#607086", fontWeight: 600 },
      data: ["Male rate", "Female rate", "Person rate"],
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: awarenessData.value.skinCancerImpact.map((item) => item.year),
      axisLine: { lineStyle: { color: "#d9e2ee" } },
      axisLabel: { color: "#718097", fontWeight: 600 },
    },
    yAxis: {
      type: "value",
      name: "Rate",
      nameTextStyle: { color: "#78859a", padding: [0, 0, 0, 6] },
      splitLine: { lineStyle: { color: "#edf1f7" } },
      axisLabel: { color: "#6f7f95" },
    },
    series: [
      {
        name: "Male rate",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 5,
        showSymbol: false,
        lineStyle: { width: 3.2, cap: "round" },
        itemStyle: { color: mscColor },
        emphasis: { focus: "series", scale: true },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(239, 143, 52, 0.2)" },
            { offset: 1, color: "rgba(239, 143, 52, 0.02)" },
          ]),
        },
        data: awarenessData.value.skinCancerImpact.map((item) => item.maleRate),
      },
      {
        name: "Female rate",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 5,
        showSymbol: false,
        lineStyle: { width: 3.2, cap: "round" },
        itemStyle: { color: nmscColor },
        emphasis: { focus: "series", scale: true },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(47, 166, 90, 0.18)" },
            { offset: 1, color: "rgba(47, 166, 90, 0.02)" },
          ]),
        },
        data: awarenessData.value.skinCancerImpact.map((item) => item.femaleRate),
      },
      {
        name: "Person rate",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 5,
        showSymbol: false,
        lineStyle: { width: 3.2, cap: "round" },
        itemStyle: { color: uvColor },
        emphasis: { focus: "series", scale: true },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(79, 115, 217, 0.16)" },
            { offset: 1, color: "rgba(79, 115, 217, 0.02)" },
          ]),
        },
        data: awarenessData.value.skinCancerImpact.map((item) => item.personRate),
      },
    ],
    dataZoom: [
      {
        type: "inside",
        start: 45,
        end: 100,
      },
      {
        type: "slider",
        height: 22,
        bottom: 18,
        start: 45,
        end: 100,
        borderColor: "rgba(214, 224, 236, 0.9)",
        fillerColor: "rgba(99, 116, 143, 0.18)",
        backgroundColor: "rgba(245, 248, 252, 0.9)",
        handleStyle: {
          color: "#ffffff",
          borderColor: "#93a2b8",
          borderWidth: 1,
          shadowBlur: 6,
          shadowColor: "rgba(60, 74, 96, 0.2)",
        },
      },
    ],
  });
}

function initTempUvChart() {
  if (!tempUvChartRef.value) {
    return;
  }

  tempUvChart = echarts.init(tempUvChartRef.value, null, { renderer: "canvas" });

  tempUvChart.setOption({
    animationDuration: 850,
    animationEasing: "cubicOut",
    color: [uvColor],
    grid: { left: 62, right: 58, top: 36, bottom: 96 },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "line",
        lineStyle: { color: "rgba(60, 73, 94, 0.24)", width: 1.4 },
      },
      backgroundColor: "rgba(255,255,255,0.92)",
      borderColor: "rgba(19,33,59,0.09)",
      borderWidth: 1,
      textStyle: { color: "#1f2a3d", fontFamily: "Manrope, Segoe UI, sans-serif" },
      extraCssText: "backdrop-filter: blur(8px); box-shadow: 0 14px 34px rgba(19,33,59,.14); border-radius: 14px;",
    },
    legend: {
      top: 0,
      left: "center",
      icon: "roundRect",
      itemWidth: 14,
      itemHeight: 6,
      textStyle: { color: "#607086", fontWeight: 600 },
      data: ["UV Index"],
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: awarenessData.value.uvTrend.map((item) => item.yearMonth),
      axisLine: { lineStyle: { color: "#d9e2ee" } },
      axisLabel: { color: "#718097", rotate: 40, fontWeight: 600 },
    },
    yAxis: {
      type: "value",
      name: "UV Index",
      nameTextStyle: { color: uvColor, fontWeight: 700, padding: [0, 8, 0, 0] },
      splitLine: { lineStyle: { color: "#edf1f7" } },
      axisLabel: { color: "#6f7f95" },
    },
    series: [
      {
        name: "UV Index",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 5,
        showSymbol: false,
        lineStyle: { width: 3.2, cap: "round" },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(79, 115, 217, 0.2)" },
            { offset: 1, color: "rgba(79, 115, 217, 0.02)" },
          ]),
        },
        data: awarenessData.value.uvTrend.map((item) => item.uvIndex),
      },
    ],
    dataZoom: [
      {
        type: "inside",
        start: 62,
        end: 100,
      },
      {
        type: "slider",
        height: 22,
        bottom: 20,
        start: 62,
        end: 100,
        borderColor: "rgba(214, 224, 236, 0.9)",
        fillerColor: "rgba(99, 116, 143, 0.18)",
        backgroundColor: "rgba(245, 248, 252, 0.9)",
        handleStyle: {
          color: "#ffffff",
          borderColor: "#93a2b8",
          borderWidth: 1,
          shadowBlur: 6,
          shadowColor: "rgba(60, 74, 96, 0.2)",
        },
      },
    ],
  });
}

function handleResize() {
  mortalityChart?.resize();
  tempUvChart?.resize();
}

onMounted(() => {
  loadAwarenessVisualizations()
    .catch((error) => {
      console.error("Failed to load awareness visualizations", error);
    })
    .finally(() => {
      window.requestAnimationFrame(() => {
        pageReady.value = true;
      });
      initMortalityChart();
      initTempUvChart();
    });

  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  mortalityChart?.dispose();
  tempUvChart?.dispose();
});
</script>

<style scoped>
.awareness-page {
  position: relative;
  display: block;
  isolation: isolate;
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 620ms ease, transform 620ms ease;
}

.awareness-page--ready {
  opacity: 1;
  transform: translateY(0);
}

.awareness-glow {
  position: absolute;
  border-radius: 999px;
  filter: blur(34px);
  pointer-events: none;
  z-index: -1;
}

.awareness-glow-a {
  width: min(420px, 70vw);
  height: 240px;
  top: -36px;
  left: -28px;
  background: radial-gradient(circle at 30% 30%, rgba(255, 197, 135, 0.42), rgba(255, 197, 135, 0));
}

.awareness-glow-b {
  width: min(430px, 72vw);
  height: 240px;
  bottom: 8px;
  right: -30px;
  background: radial-gradient(circle at 70% 70%, rgba(148, 180, 255, 0.36), rgba(148, 180, 255, 0));
}

.awareness-card {
  position: relative;
  overflow: hidden;
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.7);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.88));
  box-shadow: 0 18px 42px rgba(19, 33, 59, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.7);
  opacity: 0;
  transform: translateY(22px);
  transition: opacity 700ms ease, transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
}

.awareness-page--ready .awareness-card {
  opacity: 1;
  transform: translateY(0);
}

.awareness-card--second {
  transition-delay: 130ms;
}

.awareness-card::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.44), rgba(255, 255, 255, 0));
}

.chart-subtitle {
  color: rgba(91, 103, 122, 0.88);
  font-size: 0.95rem;
  font-weight: 500;
}

.chart-kicker {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.28rem 0.72rem;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: rgba(31, 42, 61, 0.7);
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(217, 226, 238, 0.9);
}

.chart-scroll {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 0.35rem;
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(247, 250, 255, 0.7), rgba(255, 255, 255, 0.45));
  border: 1px solid rgba(224, 232, 243, 0.8);
}

.chart-canvas {
  min-width: 1000px;
  height: 392px;
}

@media (max-width: 767px) {
  .awareness-card {
    border-radius: 24px;
  }

  .chart-kicker {
    font-size: 0.72rem;
    padding: 0.24rem 0.62rem;
  }

  .chart-canvas {
    height: 340px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .awareness-page,
  .awareness-card,
  .awareness-card--second {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
