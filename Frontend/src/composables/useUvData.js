const FALLBACK_TREND = [0.1, 0.2, 0.7, 1.8, 3.3, 5.2, 6.8, 7.2, 6.4, 4.7, 3.1, 1.5, 0.8, 0.3, 0.1];
const FALLBACK_TIMES = [
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

function toHourLabel(timeString) {
  const date = new Date(timeString);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getFallbackData() {
  const now = new Date();

  return {
    currentUv: 6,
    peakWindowText: "11:00 - 14:00",
    safeWindowText: "Before 09:00",
    peakWindowStart: "11:00",
    peakWindowEnd: "14:00",
    safeWindowMorningEnd: "09:00",
    safeWindowAfternoonStart: "17:00",
    weekday: now.toLocaleDateString([], { weekday: "long" }),
    todayDate: now.toLocaleDateString([], {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    hourlyTimes: FALLBACK_TIMES,
    hourlyUv: FALLBACK_TREND,
  };
}

function findCurrentUvFromSeries(series) {
  if (!series.length) {
    return 0;
  }

  const now = new Date();
  const nowMs = now.getTime();
  let nearestPoint = series[0];
  let minDiff = Number.POSITIVE_INFINITY;

  series.forEach((point) => {
    const pointMs = new Date(point.time).getTime();
    const diff = Math.abs(pointMs - nowMs);

    if (diff < minDiff) {
      minDiff = diff;
      nearestPoint = point;
    }
  });

  return Number(nearestPoint?.uv || 0);
}

function derivePeakWindow(times, values) {
  const maxUv = Math.max(...values, 0);
  const threshold = maxUv * 0.8;

  const indices = values
    .map((value, index) => ({ value, index }))
    .filter((item) => item.value >= threshold && item.value > 0)
    .map((item) => item.index);

  if (!indices.length) {
    return { text: "No significant UV peak", start: null, end: null };
  }

  const start = times[indices[0]];
  const end = times[indices[indices.length - 1]];
  return { text: `${start} - ${end}`, start, end };
}

function deriveSafeWindow(times, values) {
  const firstModerateIndex = values.findIndex((value) => value >= 3);

  if (firstModerateIndex <= 0) {
    return { text: "Use protection throughout the day", morningEnd: null, afternoonStart: null };
  }

  const morningEnd = times[firstModerateIndex];

  // Find afternoon safe start: last index where UV >= 3, then one step after
  let lastDangerIndex = -1;
  for (let i = values.length - 1; i >= 0; i--) {
    if (values[i] >= 3) { lastDangerIndex = i; break; }
  }
  const afternoonStart = (lastDangerIndex >= 0 && lastDangerIndex + 1 < times.length)
    ? times[lastDangerIndex + 1]
    : null;

  return { text: `Before ${morningEnd}`, morningEnd, afternoonStart };
}

export function useUvData() {
  const getUvData = async (latitude, longitude) => {
    try {
      const endpoint = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=uv_index&timezone=auto`;
      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error(`Open-Meteo request failed with status ${response.status}`);
      }

      const payload = await response.json();
      const hourly = payload?.hourly;

      if (!hourly?.time || !hourly?.uv_index) {
        throw new Error("Missing hourly uv data from API payload.");
      }

      const today = getTodayString();
      const merged = hourly.time
        .map((time, index) => ({
          time,
          uv: Number(hourly.uv_index[index] || 0),
        }))
        .filter((item) => item.time.startsWith(today));

      const daytime = merged.filter((item) => {
        const hour = new Date(item.time).getHours();
        return hour >= 6 && hour <= 20;
      });

      const chartSource = daytime.length ? daytime : merged;
      if (!chartSource.length) {
        throw new Error("No UV data points available for today.");
      }

      const hourlyTimes = chartSource.map((item) => toHourLabel(item.time));
      const hourlyUv = chartSource.map((item) => item.uv);

      const peak = derivePeakWindow(hourlyTimes, hourlyUv);
      const safe = deriveSafeWindow(hourlyTimes, hourlyUv);
      const now = new Date();

      return {
        currentUv: findCurrentUvFromSeries(merged),
        peakWindowText: peak.text,
        safeWindowText: safe.text,
        peakWindowStart: peak.start,
        peakWindowEnd: peak.end,
        safeWindowMorningEnd: safe.morningEnd,
        safeWindowAfternoonStart: safe.afternoonStart,
        weekday: now.toLocaleDateString([], { weekday: "long" }),
        todayDate: now.toLocaleDateString([], {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        hourlyTimes,
        hourlyUv,
      };
    } catch (error) {
      return {
        ...getFallbackData(),
        error: error?.message || "Unable to load UV forecast.",
      };
    }
  };

  return {
    getUvData,
  };
}
