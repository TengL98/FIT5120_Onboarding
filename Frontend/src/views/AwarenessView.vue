<template>
  <section class="awareness-page" aria-label="Awareness dashboard">
    <article class="soft-card awareness-card p-3 p-md-4 mb-4">
      <header class="mb-3 mb-md-4">
        <h1 class="section-heading mb-1">Skin Cancer Mortality Trends</h1>
        <p class="chart-subtitle mb-0">Age-standardised mortality rates in Australia</p>
      </header>

      <div class="chart-scroll" aria-label="Skin cancer mortality trends chart scroll container">
        <div ref="mortalityChartRef" class="chart-canvas"></div>
      </div>
    </article>

    <article class="soft-card awareness-card p-3 p-md-4">
      <header class="mb-3 mb-md-4">
        <h2 class="section-heading mb-1">Temperature vs UV Trend</h2>
        <p class="chart-subtitle mb-0">Monthly climate change and UV exposure trend.</p>
      </header>

      <div class="chart-scroll" aria-label="Temperature and UV trend chart scroll container">
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

let mortalityChart = null;
let tempUvChart = null;

const mscColor = "#ef8f34";
const nmscColor = "#2fa65a";
const tempColor = "#ef8f34";
const uvColor = "#4f73d9";

const mortalityData = [
  { year: 2005, mscMale: 3.8, mscFemale: 2.2, mscPerson: 3.0, nmscMale: 1.6, nmscFemale: 0.8, nmscPerson: 1.2 },
  { year: 2006, mscMale: 3.9, mscFemale: 2.2, mscPerson: 3.1, nmscMale: 1.6, nmscFemale: 0.9, nmscPerson: 1.2 },
  { year: 2007, mscMale: 4.0, mscFemale: 2.3, mscPerson: 3.2, nmscMale: 1.7, nmscFemale: 0.9, nmscPerson: 1.3 },
  { year: 2008, mscMale: 4.1, mscFemale: 2.3, mscPerson: 3.2, nmscMale: 1.7, nmscFemale: 0.9, nmscPerson: 1.3 },
  { year: 2009, mscMale: 4.1, mscFemale: 2.4, mscPerson: 3.3, nmscMale: 1.8, nmscFemale: 1.0, nmscPerson: 1.4 },
  { year: 2010, mscMale: 4.2, mscFemale: 2.4, mscPerson: 3.3, nmscMale: 1.8, nmscFemale: 1.0, nmscPerson: 1.4 },
  { year: 2011, mscMale: 4.3, mscFemale: 2.5, mscPerson: 3.4, nmscMale: 1.9, nmscFemale: 1.0, nmscPerson: 1.4 },
  { year: 2012, mscMale: 4.3, mscFemale: 2.5, mscPerson: 3.4, nmscMale: 1.9, nmscFemale: 1.1, nmscPerson: 1.5 },
  { year: 2013, mscMale: 4.4, mscFemale: 2.6, mscPerson: 3.5, nmscMale: 2.0, nmscFemale: 1.1, nmscPerson: 1.5 },
  { year: 2014, mscMale: 4.5, mscFemale: 2.6, mscPerson: 3.5, nmscMale: 2.0, nmscFemale: 1.1, nmscPerson: 1.6 },
  { year: 2015, mscMale: 4.6, mscFemale: 2.7, mscPerson: 3.6, nmscMale: 2.1, nmscFemale: 1.2, nmscPerson: 1.6 },
  { year: 2016, mscMale: 4.7, mscFemale: 2.8, mscPerson: 3.7, nmscMale: 2.1, nmscFemale: 1.2, nmscPerson: 1.7 },
  { year: 2017, mscMale: 4.7, mscFemale: 2.8, mscPerson: 3.7, nmscMale: 2.2, nmscFemale: 1.2, nmscPerson: 1.7 },
  { year: 2018, mscMale: 4.8, mscFemale: 2.9, mscPerson: 3.8, nmscMale: 2.2, nmscFemale: 1.3, nmscPerson: 1.8 },
  { year: 2019, mscMale: 4.9, mscFemale: 2.9, mscPerson: 3.8, nmscMale: 2.3, nmscFemale: 1.3, nmscPerson: 1.8 },
  { year: 2020, mscMale: 5.0, mscFemale: 3.0, mscPerson: 3.9, nmscMale: 2.3, nmscFemale: 1.3, nmscPerson: 1.8 },
  { year: 2021, mscMale: 5.0, mscFemale: 3.0, mscPerson: 4.0, nmscMale: 2.4, nmscFemale: 1.4, nmscPerson: 1.9 },
  { year: 2022, mscMale: 5.1, mscFemale: 3.1, mscPerson: 4.0, nmscMale: 2.4, nmscFemale: 1.4, nmscPerson: 1.9 },
  { year: 2023, mscMale: 5.2, mscFemale: 3.2, mscPerson: 4.1, nmscMale: 2.5, nmscFemale: 1.4, nmscPerson: 2.0 },
  { year: 2024, mscMale: 5.3, mscFemale: 3.2, mscPerson: 4.2, nmscMale: 2.5, nmscFemale: 1.5, nmscPerson: 2.0 },
];

const monthlyClimateData = [
  { year_month: "2024-01", temperature: 28.4, uvIndex: 10.5 },
  { year_month: "2024-02", temperature: 27.7, uvIndex: 9.9 },
  { year_month: "2024-03", temperature: 25.4, uvIndex: 8.8 },
  { year_month: "2024-04", temperature: 22.1, uvIndex: 7.1 },
  { year_month: "2024-05", temperature: 18.8, uvIndex: 5.6 },
  { year_month: "2024-06", temperature: 15.7, uvIndex: 4.4 },
  { year_month: "2024-07", temperature: 14.9, uvIndex: 4.1 },
  { year_month: "2024-08", temperature: 16.3, uvIndex: 4.8 },
  { year_month: "2024-09", temperature: 18.9, uvIndex: 5.8 },
  { year_month: "2024-10", temperature: 21.2, uvIndex: 6.8 },
  { year_month: "2024-11", temperature: 24.0, uvIndex: 8.4 },
  { year_month: "2024-12", temperature: 26.6, uvIndex: 9.6 },
  { year_month: "2025-01", temperature: 28.7, uvIndex: 10.7 },
  { year_month: "2025-02", temperature: 28.0, uvIndex: 10.1 },
  { year_month: "2025-03", temperature: 25.8, uvIndex: 9.0 },
  { year_month: "2025-04", temperature: 22.7, uvIndex: 7.3 },
  { year_month: "2025-05", temperature: 19.2, uvIndex: 5.9 },
  { year_month: "2025-06", temperature: 16.0, uvIndex: 4.7 },
  { year_month: "2025-07", temperature: 15.2, uvIndex: 4.3 },
  { year_month: "2025-08", temperature: 16.8, uvIndex: 5.0 },
  { year_month: "2025-09", temperature: 19.3, uvIndex: 6.1 },
  { year_month: "2025-10", temperature: 21.9, uvIndex: 7.2 },
  { year_month: "2025-11", temperature: 24.4, uvIndex: 8.7 },
  { year_month: "2025-12", temperature: 27.0, uvIndex: 9.9 },
];

function mortalityTooltipFormatter(params) {
  if (!params.length) {
    return "";
  }

  const row = mortalityData[params[0].dataIndex];
  if (!row) {
    return "";
  }

  return [
    `<div style=\"font-weight:700;margin-bottom:6px;\">Year: ${row.year}</div>`,
    `<div style=\"font-weight:700;color:${mscColor};margin-bottom:2px;\">MSC</div>`,
    `<div>Male rate: ${row.mscMale.toFixed(1)}</div>`,
    `<div>Female rate: ${row.mscFemale.toFixed(1)}</div>`,
    `<div style=\"margin-bottom:8px;\">Person rate: ${row.mscPerson.toFixed(1)}</div>`,
    `<div style=\"font-weight:700;color:${nmscColor};margin-bottom:2px;\">NMSC</div>`,
    `<div>Male rate: ${row.nmscMale.toFixed(1)}</div>`,
    `<div>Female rate: ${row.nmscFemale.toFixed(1)}</div>`,
    `<div>Person rate: ${row.nmscPerson.toFixed(1)}</div>`,
  ].join("");
}

function initMortalityChart() {
  if (!mortalityChartRef.value) {
    return;
  }

  mortalityChart = echarts.init(mortalityChartRef.value, null, { renderer: "canvas" });

  mortalityChart.setOption({
    animationDuration: 700,
    color: [mscColor, nmscColor],
    grid: { left: 55, right: 34, top: 30, bottom: 48 },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "line" },
      backgroundColor: "rgba(255,255,255,0.96)",
      borderColor: "rgba(19,33,59,0.08)",
      borderWidth: 1,
      textStyle: { color: "#1f2a3d", fontFamily: "Manrope, Segoe UI, sans-serif" },
      extraCssText: "box-shadow: 0 12px 28px rgba(19,33,59,.12); border-radius: 14px;",
      formatter: mortalityTooltipFormatter,
    },
    legend: {
      top: 0,
      left: "center",
      icon: "roundRect",
      itemWidth: 14,
      itemHeight: 6,
      textStyle: { color: "#607086", fontWeight: 600 },
      data: ["MSC", "NMSC"],
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: mortalityData.map((item) => item.year),
      axisLine: { lineStyle: { color: "#d9e2ee" } },
      axisLabel: { color: "#6e7787" },
    },
    yAxis: {
      type: "value",
      name: "Rate",
      nameTextStyle: { color: "#6e7787", padding: [0, 0, 0, 6] },
      splitLine: { lineStyle: { color: "#edf1f7" } },
      axisLabel: { color: "#6e7787" },
    },
    series: [
      {
        name: "MSC",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 7,
        lineStyle: { width: 3 },
        itemStyle: { color: mscColor },
        data: mortalityData.map((item) => item.mscPerson),
      },
      {
        name: "NMSC",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 7,
        lineStyle: { width: 3 },
        itemStyle: { color: nmscColor },
        data: mortalityData.map((item) => item.nmscPerson),
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
    animationDuration: 700,
    color: [tempColor, uvColor],
    grid: { left: 62, right: 58, top: 30, bottom: 56 },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "line" },
      backgroundColor: "rgba(255,255,255,0.96)",
      borderColor: "rgba(19,33,59,0.08)",
      borderWidth: 1,
      textStyle: { color: "#1f2a3d", fontFamily: "Manrope, Segoe UI, sans-serif" },
      extraCssText: "box-shadow: 0 12px 28px rgba(19,33,59,.12); border-radius: 14px;",
    },
    legend: {
      top: 0,
      left: "center",
      icon: "roundRect",
      itemWidth: 14,
      itemHeight: 6,
      textStyle: { color: "#607086", fontWeight: 600 },
      data: ["Temperature", "UV Index"],
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: monthlyClimateData.map((item) => item.year_month),
      axisLine: { lineStyle: { color: "#d9e2ee" } },
      axisLabel: { color: "#6e7787", rotate: 40 },
    },
    yAxis: [
      {
        type: "value",
        name: "Temperature (°C)",
        nameTextStyle: { color: tempColor, padding: [0, 0, 0, 8] },
        splitLine: { lineStyle: { color: "#edf1f7" } },
        axisLabel: { color: "#6e7787" },
      },
      {
        type: "value",
        name: "UV Index",
        nameTextStyle: { color: uvColor, padding: [0, 8, 0, 0] },
        splitLine: { show: false },
        axisLabel: { color: "#6e7787" },
      },
    ],
    series: [
      {
        name: "Temperature",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 7,
        lineStyle: { width: 3 },
        yAxisIndex: 0,
        data: monthlyClimateData.map((item) => item.temperature),
      },
      {
        name: "UV Index",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 7,
        lineStyle: { width: 3 },
        yAxisIndex: 1,
        data: monthlyClimateData.map((item) => item.uvIndex),
      },
    ],
  });
}

function handleResize() {
  mortalityChart?.resize();
  tempUvChart?.resize();
}

onMounted(() => {
  initMortalityChart();
  initTempUvChart();
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
  display: block;
}

.awareness-card {
  border-radius: 28px;
  box-shadow: 0 18px 40px rgba(19, 33, 59, 0.08);
}

.chart-subtitle {
  color: var(--ss-muted);
  font-size: 0.95rem;
  font-weight: 500;
}

.chart-scroll {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 0.35rem;
}

.chart-canvas {
  min-width: 1000px;
  height: 380px;
}

@media (max-width: 767px) {
  .awareness-card {
    border-radius: 24px;
  }

  .chart-canvas {
    height: 340px;
  }
}
</style>
