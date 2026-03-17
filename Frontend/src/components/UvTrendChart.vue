<template>
  <div ref="chartRef" class="trend-chart" role="img" aria-label="Daily UV trend chart"></div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import * as echarts from "echarts";

const props = defineProps({
  times: {
    type: Array,
    default: () => [],
  },
  values: {
    type: Array,
    default: () => [],
  },
  peakStart: {
    type: String,
    default: null,
  },
  peakEnd: {
    type: String,
    default: null,
  },
  safeMorningEnd: {
    type: String,
    default: null,
  },
  safeAfternoonStart: {
    type: String,
    default: null,
  },
});

const chartRef = ref(null);
let chartInstance;

const renderChart = () => {
  if (!chartRef.value) {
    return;
  }

  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value);
  }

  // Peak zone: soft warm amber matching the chart's orange line palette
  const markAreaData = [];

  if (props.peakStart && props.peakEnd) {
    markAreaData.push([
      {
        xAxis: props.peakStart,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(240, 140, 0, 0.18)" },
            { offset: 1, color: "rgba(240, 140, 0, 0.04)" },
          ]),
        },
        label: {
          show: true,
          formatter: "▲ Peak UV",
          position: "insideTopLeft",
          color: "#b86e00",
          fontSize: 10,
          fontWeight: 700,
          fontFamily: "Manrope, sans-serif",
          padding: [3, 6],
        },
      },
      { xAxis: props.peakEnd },
    ]);
  }

  chartInstance.setOption({
    animationDuration: 650,
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(20, 33, 57, 0.92)",
      borderColor: "transparent",
      textStyle: { color: "#fff", fontFamily: "Manrope" },
      formatter: (params) => {
        const point = params[0];
        return `${point.axisValue}<br/>UV Index: ${Math.round(Number(point.data))}`;
      },
    },
    grid: {
      left: 18,
      right: 24,
      top: 12,
      bottom: 28,
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: props.times,
      boundaryGap: false,
      axisLine: { lineStyle: { color: "#dde4ee" } },
      axisLabel: {
        color: "#7b8696",
        fontSize: 11,
        interval: 1,
      },
      axisTick: { show: false },
      name: "Time of Day",
      nameLocation: "middle",
      nameGap: 24,
      nameTextStyle: { color: "#9aa3b0", fontSize: 11, fontWeight: 600 },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: (value) => Math.max(12, Math.ceil(value.max + 1)),
      splitLine: {
        lineStyle: {
          color: "#edf2f9",
          type: "dashed",
        },
      },
      axisLabel: {
        color: "#7b8696",
        fontSize: 11,
      },
      axisLine: { show: false },
      axisTick: { show: false },
      name: "UV Index",
      nameLocation: "end",
      nameTextStyle: { color: "#9aa3b0", fontSize: 11, fontWeight: 600, padding: [0, 0, 4, 0] },
    },
    series: [
      {
        data: props.values,
        type: "line",
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 3,
          color: "#f08c00",
        },
        emphasis: {
          focus: "series",
          itemStyle: {
            color: "#f7675f",
            borderColor: "#ffffff",
            borderWidth: 2,
          },
          scale: true,
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(240, 140, 0, 0.45)" },
            { offset: 0.6, color: "rgba(247, 103, 95, 0.17)" },
            { offset: 1, color: "rgba(255, 255, 255, 0.03)" },
          ]),
        },
        markArea: markAreaData.length
          ? {
              silent: true,
              emphasis: { disabled: true },
              data: markAreaData,
            }
          : undefined,
      },
    ],
  });
};

const handleResize = () => {
  chartInstance?.resize();
};

onMounted(() => {
  renderChart();
  window.addEventListener("resize", handleResize);
});

watch(
  () => [props.times, props.values, props.peakStart, props.peakEnd, props.safeMorningEnd, props.safeAfternoonStart],
  () => {
    renderChart();
  },
  { deep: true }
);

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  chartInstance?.dispose();
});
</script>

<style scoped>
.trend-chart {
  width: 100%;
  height: 340px;
}

@media (max-width: 767px) {
  .trend-chart {
    height: 290px;
  }
}
</style>
