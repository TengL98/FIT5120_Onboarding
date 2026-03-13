<template>
  <section class="awareness-page" :class="{ 'awareness-page--ready': pageReady }" aria-label="Awareness dashboard">
    <div class="awareness-glow awareness-glow-a" aria-hidden="true"></div>
    <div class="awareness-glow awareness-glow-b" aria-hidden="true"></div>

    <article class="soft-card awareness-card awareness-card--first p-3 p-md-4 mb-4">
      <header class="mb-3 mb-md-4 d-flex flex-wrap align-items-start justify-content-between gap-2">
        <div>
          <h1 class="section-heading mb-1">Skin Cancer Mortality Trends</h1>
          <p class="chart-subtitle mb-0">Age-standardised mortality rates in Australia</p>
        </div>
        <span class="chart-kicker">Annual series</span>
      </header>

      <div class="chart-scroll" aria-label="Skin cancer mortality trends chart scroll container">
        <div ref="mortalityChartRef" class="chart-canvas"></div>
      </div>
    </article>

    <article class="soft-card awareness-card awareness-card--second p-3 p-md-4">
      <header class="mb-3 mb-md-4 d-flex flex-wrap align-items-start justify-content-between gap-2">
        <div>
          <h2 class="section-heading mb-1">Temperature vs UV Trend</h2>
          <p class="chart-subtitle mb-0">Monthly climate change and UV exposure trend.</p>
        </div>
        <span class="chart-kicker">Dual-axis monthly</span>
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
const pageReady = ref(false);

let mortalityChart = null;
let tempUvChart = null;

const mscColor = "#ef8f34";
const nmscColor = "#2fa65a";
const tempColor = "#ef8f34";
const uvColor = "#4f73d9";

const mortalityData = [
  { year: 1995, mscMale: 2.9, mscFemale: 1.7, mscPerson: 2.3, nmscMale: 1.2, nmscFemale: 0.6, nmscPerson: 0.9 },
  { year: 1996, mscMale: 3.0, mscFemale: 1.8, mscPerson: 2.4, nmscMale: 1.2, nmscFemale: 0.6, nmscPerson: 0.9 },
  { year: 1997, mscMale: 3.1, mscFemale: 1.8, mscPerson: 2.4, nmscMale: 1.3, nmscFemale: 0.7, nmscPerson: 1.0 },
  { year: 1998, mscMale: 3.2, mscFemale: 1.9, mscPerson: 2.5, nmscMale: 1.3, nmscFemale: 0.7, nmscPerson: 1.0 },
  { year: 1999, mscMale: 3.2, mscFemale: 1.9, mscPerson: 2.5, nmscMale: 1.4, nmscFemale: 0.7, nmscPerson: 1.0 },
  { year: 2000, mscMale: 3.3, mscFemale: 2.0, mscPerson: 2.6, nmscMale: 1.4, nmscFemale: 0.8, nmscPerson: 1.1 },
  { year: 2001, mscMale: 3.4, mscFemale: 2.0, mscPerson: 2.7, nmscMale: 1.5, nmscFemale: 0.8, nmscPerson: 1.1 },
  { year: 2002, mscMale: 3.5, mscFemale: 2.1, mscPerson: 2.8, nmscMale: 1.5, nmscFemale: 0.8, nmscPerson: 1.2 },
  { year: 2003, mscMale: 3.6, mscFemale: 2.1, mscPerson: 2.8, nmscMale: 1.5, nmscFemale: 0.8, nmscPerson: 1.2 },
  { year: 2004, mscMale: 3.7, mscFemale: 2.2, mscPerson: 2.9, nmscMale: 1.6, nmscFemale: 0.8, nmscPerson: 1.2 },
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
  { year: 2025, mscMale: 5.3, mscFemale: 3.3, mscPerson: 4.3, nmscMale: 2.6, nmscFemale: 1.5, nmscPerson: 2.1 },
  { year: 2026, mscMale: 5.4, mscFemale: 3.3, mscPerson: 4.3, nmscMale: 2.6, nmscFemale: 1.6, nmscPerson: 2.1 },
];

const monthlyClimateData = [
  { year_month: "2023-01", temperature: 28.0, uvIndex: 10.2 },
  { year_month: "2023-02", temperature: 27.4, uvIndex: 9.7 },
  { year_month: "2023-03", temperature: 25.0, uvIndex: 8.5 },
  { year_month: "2023-04", temperature: 21.9, uvIndex: 6.9 },
  { year_month: "2023-05", temperature: 18.4, uvIndex: 5.4 },
  { year_month: "2023-06", temperature: 15.5, uvIndex: 4.3 },
  { year_month: "2023-07", temperature: 14.8, uvIndex: 4.0 },
  { year_month: "2023-08", temperature: 16.2, uvIndex: 4.8 },
  { year_month: "2023-09", temperature: 18.6, uvIndex: 5.7 },
  { year_month: "2023-10", temperature: 20.9, uvIndex: 6.7 },
  { year_month: "2023-11", temperature: 23.6, uvIndex: 8.1 },
  { year_month: "2023-12", temperature: 26.1, uvIndex: 9.3 },
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
  { year_month: "2026-01", temperature: 28.9, uvIndex: 10.8 },
  { year_month: "2026-02", temperature: 28.2, uvIndex: 10.2 },
  { year_month: "2026-03", temperature: 26.0, uvIndex: 9.2 },
  { year_month: "2026-04", temperature: 22.8, uvIndex: 7.4 },
  { year_month: "2026-05", temperature: 19.4, uvIndex: 5.9 },
  { year_month: "2026-06", temperature: 16.2, uvIndex: 4.7 },
  { year_month: "2026-07", temperature: 15.5, uvIndex: 4.3 },
  { year_month: "2026-08", temperature: 16.9, uvIndex: 5.1 },
  { year_month: "2026-09", temperature: 19.5, uvIndex: 6.1 },
  { year_month: "2026-10", temperature: 22.1, uvIndex: 7.3 },
  { year_month: "2026-11", temperature: 24.7, uvIndex: 8.8 },
  { year_month: "2026-12", temperature: 27.3, uvIndex: 10.0 },
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
    animationDuration: 850,
    animationEasing: "cubicOut",
    color: [mscColor, nmscColor],
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
      data: ["MSC", "NMSC"],
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: mortalityData.map((item) => item.year),
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
        name: "MSC",
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
        data: mortalityData.map((item) => item.mscPerson),
      },
      {
        name: "NMSC",
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
        data: mortalityData.map((item) => item.nmscPerson),
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
    color: [tempColor, uvColor],
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
      data: ["Temperature", "UV Index"],
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: monthlyClimateData.map((item) => item.year_month),
      axisLine: { lineStyle: { color: "#d9e2ee" } },
      axisLabel: { color: "#718097", rotate: 40, fontWeight: 600 },
    },
    yAxis: [
      {
        type: "value",
        name: "Temperature (°C)",
        nameTextStyle: { color: tempColor, fontWeight: 700, padding: [0, 0, 0, 8] },
        splitLine: { lineStyle: { color: "#edf1f7" } },
        axisLabel: { color: "#6f7f95" },
      },
      {
        type: "value",
        name: "UV Index",
        nameTextStyle: { color: uvColor, fontWeight: 700, padding: [0, 8, 0, 0] },
        splitLine: { show: false },
        axisLabel: { color: "#6f7f95" },
      },
    ],
    series: [
      {
        name: "Temperature",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 5,
        showSymbol: false,
        lineStyle: { width: 3.2, cap: "round" },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(239, 143, 52, 0.2)" },
            { offset: 1, color: "rgba(239, 143, 52, 0.02)" },
          ]),
        },
        yAxisIndex: 0,
        data: monthlyClimateData.map((item) => item.temperature),
      },
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
        yAxisIndex: 1,
        data: monthlyClimateData.map((item) => item.uvIndex),
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
  window.requestAnimationFrame(() => {
    pageReady.value = true;
  });
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
