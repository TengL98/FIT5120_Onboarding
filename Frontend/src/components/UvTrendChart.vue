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

  chartInstance.setOption({
    animationDuration: 650,
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(20, 33, 57, 0.92)",
      borderColor: "transparent",
      textStyle: { color: "#fff", fontFamily: "Manrope" },
      formatter: (params) => {
        const point = params[0];
        return `${point.axisValue}<br/>UV ${Math.round(Number(point.data))}`;
      },
    },
    grid: {
      left: 18,
      right: 14,
      top: 20,
      bottom: 20,
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
      },
      axisTick: { show: false },
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
  () => [props.times, props.values],
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
  height: 320px;
}

@media (max-width: 767px) {
  .trend-chart {
    height: 280px;
  }
}
</style>
