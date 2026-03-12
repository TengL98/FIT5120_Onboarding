function normalizeUv(uv) {
  const value = Number(uv);
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

export function getUvCategory(uv) {
  const value = normalizeUv(uv);

  if (value <= 2) return "Low";
  if (value <= 5) return "Moderate";
  if (value <= 7) return "High";
  if (value <= 10) return "Very High";
  return "Extreme";
}

export function getUvColor(uv) {
  const category = getUvCategory(uv);

  const palette = {
    Low: "#2f9e44",
    Moderate: "#e3b400",
    High: "#f08c00",
    "Very High": "#f7675f",
    Extreme: "#c92a2a",
  };

  return palette[category];
}

export function getUvShortMessage(uv) {
  const category = getUvCategory(uv);

  return `Current risk: ${category}`;
}

export function getUvLongAdvice(uv) {
  const category = getUvCategory(uv);

  const advice = {
    Low: "Enjoy your day outside. Protection is usually not required unless you are outside for long periods.",
    Moderate:
      "Wear sunglasses and apply sunscreen if spending time outdoors.",
    High:
      "Apply SPF 30+ sunscreen, wear protective clothing, and reduce direct exposure during midday.",
    "Very High":
      "Seek shade during peak UV hours and reapply sunscreen every 2 hours when outdoors.",
    Extreme:
      "Avoid direct sun exposure during peak hours. Use maximum protection including shade, sunscreen, hat, and sunglasses.",
  };

  return advice[category];
}

export function getUvScalePosition(uv) {
  const maxScaleUv = 12;
  const safeUv = Math.min(normalizeUv(uv), maxScaleUv);
  return (safeUv / maxScaleUv) * 100;
}
