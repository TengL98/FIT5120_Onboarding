<template>
  <section class="awareness-page" :class="{ 'awareness-page--ready': pageReady }" aria-label="Awareness dashboard">
    <div class="awareness-glow awareness-glow-a" aria-hidden="true"></div>
    <div class="awareness-glow awareness-glow-b" aria-hidden="true"></div>

    <article class="soft-card awareness-card awareness-card--intro p-3 p-md-4 mb-4" aria-label="Awareness guide">
      <header class="mb-3">
        <h1 class="section-heading mb-1">UV is not just about heat. Know it, share it, protect your crew.</h1>
        <p class="chart-subtitle mb-0">
          This page turns Australia UV and skin-cancer data into simple talking points so you can explain the why to
          friends, not just repeat rules.
        </p>
      </header>

      <div class="share-pill-row mb-3" role="list" aria-label="Share theme">
        <span class="share-pill" role="listitem">Myth-busting</span>
        <span class="share-pill" role="listitem">Data-backed</span>
        <span class="share-pill" role="listitem">Friend-to-friend awareness</span>
      </div>

      <div class="guide-tag-row" role="list" aria-label="Awareness goals">
        <span class="guide-tag" role="listitem">You can get high UV even when it does not feel super hot</span>
        <span class="guide-tag" role="listitem">Rate means cases per 100,000 people for fair comparison</span>
        <span class="guide-tag" role="listitem">One smart share can influence your whole friend group</span>
      </div>

      <section class="insights-grid mt-3" aria-label="Key insights">
        <article v-for="item in keyInsights" :key="item.title" class="insight-card">
          <p class="insight-title mb-1">{{ item.title }}</p>
          <p class="insight-value mb-1">{{ item.value }}</p>
          <p class="insight-note mb-0">{{ item.note }}</p>
        </article>
      </section>
    </article>

    <article class="soft-card awareness-card awareness-card--first p-3 p-md-4 mb-4">
      <header class="mb-3 mb-md-4 d-flex flex-wrap align-items-start justify-content-between gap-2">
        <div>
          <h2 class="section-heading mb-1">Skin Cancer Impact Trends</h2>
          <p class="chart-subtitle mb-0">Annual incidence rate in Australia (per 100,000 people)</p>
        </div>
        <button class="toggle-button" :class="{ active: showDeadlier }" @click="showDeadlier = !showDeadlier" aria-label="Toggle between cancer types">
          <span class="toggle-option-1">Deadlier</span>
          <span class="toggle-slider"></span>
          <span class="toggle-option-2">More Common</span>
        </button>
      </header>

      <div v-if="showDeadlier" class="chart-fade-in">
        <div class="chart-reading-note mb-3" aria-label="How to read this chart">
          <p class="chart-reading-title mb-1">Quick read</p>
          <p class="chart-reading-text mb-0">
            Look at the long-term direction, not one single year. The trend shows persistent increase over time, which means the risk burden is persistent and worth acting on early.
          </p>
        </div>

        <div class="chart-scroll-no-scroll" aria-label="Deadlier skin cancer chart">
          <div ref="mscChartRef" class="chart-canvas"></div>
        </div>
        <p class="chart-type-label">Deadlier Skin Cancer</p>
      </div>

      <div v-else class="chart-fade-in">
        <div class="chart-reading-note mb-3" aria-label="How to read this chart">
          <p class="chart-reading-title mb-1">Quick read</p>
          <p class="chart-reading-text mb-0">
            Look at the long-term direction, not one single year. The trend shows persistent increase over time, which means the risk burden is persistent and worth acting on early.
          </p>
        </div>

        <div class="chart-scroll-no-scroll" aria-label="More common skin cancer chart">
          <div ref="nmscChartRef" class="chart-canvas"></div>
        </div>
        <p class="chart-type-label">More Common Skin Cancer</p>
      </div>
    </article>

    <article class="soft-card awareness-card awareness-card--second p-3 p-md-4">
      <header class="mb-3 mb-md-4 d-flex flex-wrap align-items-start justify-content-between gap-2">
        <div>
          <h2 class="section-heading mb-1">UV and Temperature Comparison</h2>
          <p class="chart-subtitle mb-0">Monthly UV index and temperature trend in Melbourne</p>
        </div>
        <span class="chart-kicker">Dual-axis monthly series</span>
      </header>

      <div class="chart-reading-note mb-3" aria-label="How to read this chart">
        <p class="chart-reading-title mb-1">Quick read</p>
        <p class="chart-reading-text mb-0">
          Spot months where UV stays high while temperature looks moderate. That is the key myth breaker: cooler feeling
          weather can still mean meaningful UV exposure.
        </p>
      </div>

      <div class="chart-scroll" aria-label="UV and temperature comparison chart scroll container">
        <div ref="tempUvChartRef" class="chart-canvas"></div>
      </div>
    </article>
  </section>
</template>

<script setup>
import * as echarts from "echarts";
import { computed, onBeforeUnmount, onMounted, ref, watch, nextTick } from "vue";

const mscChartRef = ref(null);
const nmscChartRef = ref(null);
const tempUvChartRef = ref(null);
const showDeadlier = ref(true);
const pageReady = ref(false);

let mscChart = null;
let nmscChart = null;
let tempUvChart = null;

const mscColor = "#ef8f34";
const nmscColor = "#2fa65a";
const uvColor = "#4f73d9";
const tempColor = "#f29f54";
const AWARENESS_API_URL =
  "https://dpak8q4na5.execute-api.ap-southeast-2.amazonaws.com/dev_visual/awareness/visualizations";

const awarenessData = ref({
  skinCancerImpact: {
    rows: [],
    msc: { years: [], femaleRate: [], maleRate: [], personRate: [] },
    nmsc: { years: [], femaleRate: [], maleRate: [], personRate: [] },
  },
  uvTemperatureTrend: [],
});

function toPercentChange(start, end) {
  if (!Number.isFinite(start) || !Number.isFinite(end) || start <= 0) {
    return null;
  }

  return ((end - start) / start) * 100;
}

function formatSignedPercent(value) {
  if (!Number.isFinite(value)) {
    return "N/A";
  }

  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(1)}%`;
}

const keyInsights = computed(() => {
  const rows = awarenessData.value.skinCancerImpact.rows;
  const uvRows = awarenessData.value.uvTemperatureTrend;

  if (!rows.length || !uvRows.length) {
    return [
      {
        title: "Data loading",
        value: "Waiting for data",
        note: "Insights appear once the awareness API response is available.",
      },
      {
        title: "Trend summary",
        value: "Pending",
        note: "Skin cancer and UV trends are calculated from backend records.",
      },
      {
        title: "Myth check",
        value: "Pending",
        note: "We compare UV and temperature patterns to challenge common assumptions.",
      },
    ];
  }

  const firstCancer = rows[0];
  const lastCancer = rows[rows.length - 1];
  const mscChange = toPercentChange(firstCancer.mscPersonRate, lastCancer.mscPersonRate);
  const nmscChange = toPercentChange(firstCancer.nmscPersonRate, lastCancer.nmscPersonRate);

  const highUvMonths = uvRows.filter((item) => item.uvIndex >= 8).length;
  const moderateTempMonths = uvRows.filter((item) => item.temperature <= 24).length;
  const highUvModerateTempMonths = uvRows.filter((item) => item.uvIndex >= 8 && item.temperature <= 24).length;
  const overlapRate = highUvMonths > 0 ? (highUvModerateTempMonths / highUvMonths) * 100 : 0;

  return [
    {
      title: "Deadlier skin cancer trend",
      value: `${formatSignedPercent(mscChange)} since ${firstCancer.year}`,
      note: `Person rate changed from ${firstCancer.mscPersonRate.toFixed(1)} to ${lastCancer.mscPersonRate.toFixed(1)} per 100,000 people.`,
    },
    {
      title: "More common skin cancer trend",
      value: `${formatSignedPercent(nmscChange)} since ${firstCancer.year}`,
      note: `Person rate changed from ${firstCancer.nmscPersonRate.toFixed(1)} to ${lastCancer.nmscPersonRate.toFixed(1)} per 100,000 people.`,
    },
    {
      title: "Myth check: heat vs UV",
      value: `${overlapRate.toFixed(0)}% of high-UV months are <=24C`,
      note: `${highUvModerateTempMonths} of ${highUvMonths} high-UV months occurred without very high temperature (moderate-temp months total: ${moderateTempMonths}).`,
    },
  ];
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
  const temperatureTrend = payload?.temperatureTrend || {};

  const mscData = skinCancerImpact?.MSC || {};
  const nmscData = skinCancerImpact?.NMSC || {};

  const mscYears = Array.isArray(mscData.years) ? mscData.years : [];
  const nmscYears = Array.isArray(nmscData.years) ? nmscData.years : [];

  const mscFemaleRates = toNumberArray(mscData.female_rate);
  const mscMaleRates = toNumberArray(mscData.male_rate);
  const mscPersonRates = toNumberArray(mscData.person_rate);

  const nmscFemaleRates = toNumberArray(nmscData.female_rate);
  const nmscMaleRates = toNumberArray(nmscData.male_rate);
  const nmscPersonRates = toNumberArray(nmscData.person_rate);

  const mergedYears = mscYears.length >= nmscYears.length ? mscYears : nmscYears;
  const skinCancerRows = mergedYears.map((year, index) => ({
    year,
    mscMaleRate: mscMaleRates[index] ?? 0,
    mscFemaleRate: mscFemaleRates[index] ?? 0,
    mscPersonRate: mscPersonRates[index] ?? 0,
    nmscMaleRate: nmscMaleRates[index] ?? 0,
    nmscFemaleRate: nmscFemaleRates[index] ?? 0,
    nmscPersonRate: nmscPersonRates[index] ?? 0,
  }));

  const yearMonth = Array.isArray(uvTrend.year_month) ? uvTrend.year_month : [];
  const uvIndex = toNumberArray(uvTrend.uv_index);
  const tempYearMonth = Array.isArray(temperatureTrend.year_month) ? temperatureTrend.year_month : [];
  const temperature = toNumberArray(temperatureTrend.temperature);

  const monthLabels = yearMonth.length >= tempYearMonth.length ? yearMonth : tempYearMonth;
  const uvTemperatureRows = monthLabels.map((label, index) => ({
    yearMonth: label,
    uvIndex: uvIndex[index] ?? 0,
    temperature: temperature[index] ?? 0,
  }));

  return {
    skinCancerImpact: {
      rows: skinCancerRows,
      msc: {
        years: mscYears,
        femaleRate: mscFemaleRates,
        maleRate: mscMaleRates,
        personRate: mscPersonRates,
      },
      nmsc: {
        years: nmscYears,
        femaleRate: nmscFemaleRates,
        maleRate: nmscMaleRates,
        personRate: nmscPersonRates,
      },
    },
    uvTemperatureTrend: uvTemperatureRows,
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

function mscTooltipFormatter(params) {
  if (!params.length) {
    return "";
  }

  const row = awarenessData.value.skinCancerImpact.rows[params[0].dataIndex];
  if (!row) {
    return "";
  }

  return [
    `<div style="font-weight:700;margin-bottom:6px;">Year: ${row.year}</div>`,
    `<div style="font-weight:700;color:${mscColor};margin-bottom:2px;">Deadlier Skin Cancer (per 100,000 people)</div>`,
    `<div style="margin-bottom:2px;">Male: ${row.mscMaleRate.toFixed(2)}</div>`,
    `<div style="margin-bottom:2px;">Female: ${row.mscFemaleRate.toFixed(2)}</div>`,
    `<div>Person: ${row.mscPersonRate.toFixed(2)}</div>`,
  ].join("");
}

function nmscTooltipFormatter(params) {
  if (!params.length) {
    return "";
  }

  const row = awarenessData.value.skinCancerImpact.rows[params[0].dataIndex];
  if (!row) {
    return "";
  }

  return [
    `<div style="font-weight:700;margin-bottom:6px;">Year: ${row.year}</div>`,
    `<div style="font-weight:700;color:${nmscColor};margin-bottom:2px;">More Common Skin Cancer (per 100,000 people)</div>`,
    `<div style="margin-bottom:2px;">Male: ${row.nmscMaleRate.toFixed(2)}</div>`,
    `<div style="margin-bottom:2px;">Female: ${row.nmscFemaleRate.toFixed(2)}</div>`,
    `<div>Person: ${row.nmscPersonRate.toFixed(2)}</div>`,
  ].join("");
}

function initMscChart() {
  if (!mscChartRef.value) {
    return;
  }

  mscChart = echarts.init(mscChartRef.value, null, { renderer: "canvas" });

  mscChart.setOption({
    animationDuration: 850,
    animationEasing: "cubicOut",
    color: [mscColor],
    grid: { left: 84, right: 84, top: 36, bottom: 48, containLabel: true },
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
      formatter: mscTooltipFormatter,
    },
    legend: {
      top: 0,
      left: "center",
      icon: "roundRect",
      itemWidth: 14,
      itemHeight: 6,
      textStyle: { color: "#607086", fontWeight: 600 },
      data: ["Deadlier Skin Cancer"],
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: awarenessData.value.skinCancerImpact.rows.map((item) => item.year),
      axisLine: { lineStyle: { color: "#d9e2ee" } },
      axisLabel: { color: "#718097", fontWeight: 600 },
    },
    yAxis: {
      type: "value",
      name: "Incidence rate (/100,000 people)",
      nameLocation: "middle",
      nameGap: 52,
      nameRotate: 90,
      nameTextStyle: { color: mscColor, fontWeight: 700 },
      splitLine: { lineStyle: { color: "#edf1f7" } },
      axisLabel: { color: "#6f7f95" },
    },
    series: [
      {
        name: "Deadlier Skin Cancer",
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
        data: awarenessData.value.skinCancerImpact.rows.map((item) => item.mscPersonRate),
      },
    ],
  });
}

function initNmscChart() {
  if (!nmscChartRef.value) {
    return;
  }

  nmscChart = echarts.init(nmscChartRef.value, null, { renderer: "canvas" });

  nmscChart.setOption({
    animationDuration: 850,
    animationEasing: "cubicOut",
    color: [nmscColor],
    grid: { left: 84, right: 84, top: 36, bottom: 48, containLabel: true },
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
      formatter: nmscTooltipFormatter,
    },
    legend: {
      top: 0,
      left: "center",
      icon: "roundRect",
      itemWidth: 14,
      itemHeight: 6,
      textStyle: { color: "#607086", fontWeight: 600 },
      data: ["More Common Skin Cancer"],
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: awarenessData.value.skinCancerImpact.rows.map((item) => item.year),
      axisLine: { lineStyle: { color: "#d9e2ee" } },
      axisLabel: { color: "#718097", fontWeight: 600 },
    },
    yAxis: {
      type: "value",
      name: "Incidence rate (/100,000 people)",
      nameLocation: "middle",
      nameGap: 52,
      nameRotate: 90,
      nameTextStyle: { color: nmscColor, fontWeight: 700 },
      splitLine: { lineStyle: { color: "#edf1f7" } },
      axisLabel: { color: "#6f7f95" },
    },
    series: [
      {
        name: "More Common Skin Cancer",
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
        data: awarenessData.value.skinCancerImpact.rows.map((item) => item.nmscPersonRate),
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
    color: [uvColor, tempColor],
    grid: { left: 62, right: 62, top: 36, bottom: 48 },
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
      formatter: (params) => {
        if (!Array.isArray(params) || !params.length) {
          return "";
        }

        const row = awarenessData.value.uvTemperatureTrend[params[0].dataIndex];
        if (!row) {
          return "";
        }

        return [
          `<div style="font-weight:700;margin-bottom:6px;">Month: ${row.yearMonth}</div>`,
          `<div style="margin-bottom:2px;color:${uvColor};font-weight:700;">UV Index</div>`,
          `<div style="margin-bottom:6px;">${row.uvIndex.toFixed(0)}</div>`,
          `<div style="margin-bottom:2px;color:${tempColor};font-weight:700;">Temperature</div>`,
          `<div>${row.temperature.toFixed(0)} &deg;C</div>`,
        ].join("");
      },
    },
    legend: {
      top: 0,
      left: "center",
      icon: "roundRect",
      itemWidth: 14,
      itemHeight: 6,
      textStyle: { color: "#607086", fontWeight: 600 },
      data: ["UV Index", "Temperature (°C)"],
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: awarenessData.value.uvTemperatureTrend.map((item) => item.yearMonth),
      axisLine: { lineStyle: { color: "#d9e2ee" } },
      axisLabel: { color: "#718097", rotate: 40, fontWeight: 600 },
    },
    yAxis: [
      {
        type: "value",
        name: "UV Index",
        nameTextStyle: { color: uvColor, fontWeight: 700, padding: [0, 8, 0, 0] },
        splitLine: { lineStyle: { color: "#edf1f7" } },
        axisLabel: { color: "#6f7f95" },
      },
      {
        type: "value",
        name: "Temperature (°C)",
        position: "right",
        nameTextStyle: { color: tempColor, fontWeight: 700, padding: [0, 0, 0, 8] },
        splitLine: { show: false },
        axisLabel: { color: "#6f7f95" },
      },
    ],
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
        data: awarenessData.value.uvTemperatureTrend.map((item) => item.uvIndex),
      },
      {
        name: "Temperature (°C)",
        type: "line",
        yAxisIndex: 1,
        smooth: true,
        symbol: "circle",
        symbolSize: 5,
        showSymbol: false,
        lineStyle: { width: 2.8, cap: "round" },
        itemStyle: { color: tempColor },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(242, 159, 84, 0.18)" },
            { offset: 1, color: "rgba(242, 159, 84, 0.02)" },
          ]),
        },
        data: awarenessData.value.uvTemperatureTrend.map((item) => item.temperature),
      },
    ],
  });
}

function handleResize() {
  mscChart?.resize();
  nmscChart?.resize();
  tempUvChart?.resize();
}

watch(showDeadlier, async () => {
  if (showDeadlier.value) {
    nmscChart?.dispose();
    nmscChart = null;
    await nextTick();
    initMscChart();
  } else {
    mscChart?.dispose();
    mscChart = null;
    await nextTick();
    initNmscChart();
  }
});

onMounted(() => {
  loadAwarenessVisualizations()
    .catch((error) => {
      console.error("Failed to load awareness visualizations", error);
    })
    .finally(() => {
      window.requestAnimationFrame(() => {
        pageReady.value = true;
      });
      initMscChart();
      initNmscChart();
      initTempUvChart();
    });

  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  mscChart?.dispose();
  nmscChart?.dispose();
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
  transition: opacity 700ms ease, transform 700ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 280ms ease, border-color 280ms ease;
}

.awareness-page--ready .awareness-card {
  opacity: 1;
  transform: translateY(0);
}

.awareness-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 24px 46px rgba(19, 33, 59, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.75);
  border-color: rgba(203, 218, 240, 0.82);
}

.awareness-card--second {
  transition-delay: 130ms;
}

.awareness-card--intro {
  transition-delay: 0ms;
  background:
    radial-gradient(circle at top right, rgba(255, 189, 110, 0.22), transparent 50%),
    radial-gradient(circle at bottom left, rgba(130, 190, 255, 0.2), transparent 52%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(255, 255, 255, 0.9));
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

.awareness-eyebrow {
  font-size: 0.76rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(74, 93, 123, 0.82);
}

.share-pill-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.48rem;
}

.share-pill {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.3rem 0.62rem;
  font-size: 0.76rem;
  font-weight: 800;
  color: rgba(41, 60, 92, 0.88);
  border: 1px solid rgba(194, 211, 236, 0.72);
  background: linear-gradient(180deg, rgba(255, 247, 235, 0.95), rgba(240, 249, 255, 0.95));
}

.guide-tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.guide-tag {
  border-radius: 999px;
  border: 1px solid rgba(171, 196, 228, 0.38);
  background: linear-gradient(180deg, rgba(245, 250, 255, 0.95), rgba(252, 255, 250, 0.95));
  color: rgba(43, 59, 84, 0.86);
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.3rem 0.62rem;
  animation: fadeUp 420ms ease both;
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.65rem;
}

.insight-card {
  border-radius: 16px;
  border: 1px solid rgba(212, 224, 238, 0.92);
  background: rgba(255, 255, 255, 0.88);
  padding: 0.68rem 0.72rem;
  transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease;
  animation: fadeUp 520ms ease both;
}

.insight-card:hover {
  transform: translateY(-2px);
  border-color: rgba(188, 209, 236, 0.95);
  box-shadow: 0 12px 22px rgba(29, 49, 78, 0.1);
}

.insight-title {
  font-size: 0.76rem;
  color: rgba(102, 115, 135, 0.9);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  font-weight: 700;
}

.insight-value {
  font-size: 0.97rem;
  font-weight: 800;
  color: rgba(28, 43, 67, 0.92);
}

.insight-note {
  font-size: 0.81rem;
  line-height: 1.45;
  color: rgba(92, 106, 126, 0.88);
}

.chart-reading-note {
  border-radius: 14px;
  border: 1px solid rgba(210, 222, 237, 0.9);
  background: linear-gradient(180deg, rgba(248, 252, 255, 0.92), rgba(255, 255, 255, 0.88));
  padding: 0.62rem 0.72rem;
  transition: transform 220ms ease, border-color 220ms ease, box-shadow 220ms ease;
}

.chart-reading-note:hover {
  transform: translateY(-1px);
  border-color: rgba(187, 207, 233, 0.92);
  box-shadow: 0 10px 18px rgba(35, 55, 86, 0.08);
}

.chart-reading-title {
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgba(78, 96, 122, 0.9);
}

.chart-reading-text {
  font-size: 0.88rem;
  line-height: 1.48;
  color: rgba(70, 87, 112, 0.9);
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

.toggle-button {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  width: 220px;
  height: 32px;
  padding: 0 8px;
  border: none;
  background: rgba(242, 245, 250, 0.95);
  border: 1px solid rgba(207, 220, 237, 0.85);
  border-radius: 999px;
  cursor: pointer;
  transition: all 280ms ease;
  position: relative;
}

.toggle-button:hover {
  background: rgba(232, 240, 250, 0.98);
  border-color: rgba(177, 200, 231, 0.9);
}

.toggle-option-1,
.toggle-option-2 {
  font-size: 0.75rem;
  font-weight: 700;
  color: rgba(80, 100, 130, 0.8);
  letter-spacing: 0.01em;
  transition: color 280ms ease;
  flex: 1;
  text-align: center;
  z-index: 2;
}

.toggle-slider {
  position: absolute;
  width: calc(50% - 4px);
  height: 26px;
  border-radius: 999px;
  background: rgba(239, 143, 52, 0.15);
  border: 1px solid rgba(239, 143, 52, 0.28);
  left: calc(50% + 0px);
  transition: left 280ms cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 1;
}

.toggle-button.active .toggle-slider {
  left: 4px;
}

.toggle-button.active .toggle-option-1 {
  color: #ef8f34;
  font-weight: 800;
}

.toggle-button:not(.active) .toggle-option-2 {
  color: rgba(47, 166, 90, 0.8);
  font-weight: 800;
}

.chart-scroll {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 0.35rem;
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(247, 250, 255, 0.7), rgba(255, 255, 255, 0.45));
  border: 1px solid rgba(224, 232, 243, 0.8);
}

.chart-scroll-no-scroll {
  width: 100%;
  overflow: hidden;
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(247, 250, 255, 0.7), rgba(255, 255, 255, 0.45));
  border: 1px solid rgba(224, 232, 243, 0.8);
  padding-bottom: 0.35rem;
}

.chart-fade-in {
  animation: fadeInChart 380ms ease both;
}

@keyframes fadeInChart {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.chart-type-label {
  text-align: center;
  margin-top: 0.8rem;
  font-size: 0.81rem;
  font-weight: 600;
  color: rgba(91, 103, 122, 0.76);
  letter-spacing: 0.01em;
}

.chart-canvas {
  width: 100%;
  height: 392px;
}

@media (max-width: 991px) {
  .chart-canvas {
    width: 100%;
    height: 360px;
  }
}

@media (max-width: 767px) {
  .awareness-card {
    border-radius: 24px;
  }

  .share-pill {
    font-size: 0.72rem;
  }

  .insights-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .chart-kicker {
    font-size: 0.72rem;
    padding: 0.24rem 0.62rem;
  }

  .chart-canvas {
    width: 100%;
    height: 340px;
  }
}

@media (max-width: 575px) {
  .chart-canvas {
    width: 100%;
    height: 300px;
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

  .guide-tag,
  .insight-card {
    animation: none;
  }
}
</style>
