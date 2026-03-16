<template>
  <section class="prevention-page" aria-label="Prevention dashboard">
    <UvHeroSection
      :location-name="state.locationName"
      :current-uv="state.currentUv"
      :uv-category="state.uvCategory"
      :uv-short-message="state.uvShortMessage"
      :uv-color="state.uvColor"
      :peak-window-text="state.peakWindowText"
      :loading="state.loading"
    />

    <section
      v-if="state.showLocationPrompt"
      class="soft-card location-prompt-card reveal-card p-3 p-md-4 mb-5"
      style="--reveal-delay: 60ms"
      aria-label="Location setup"
    >
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
        <h2 class="section-heading mb-0">Set Your Location</h2>
        <button class="location-action" type="button" @click="useLiveLocation">Use current location</button>
      </div>

      <p class="location-note mb-3">
        No saved location found. We are currently using Melbourne as default.
      </p>

      <label for="preventionSuburbSearch" class="small fw-semibold text-secondary mb-2">Enter suburb</label>
      <div class="location-search-wrap">
        <input
          id="preventionSuburbSearch"
          v-model.trim="searchQuery"
          class="form-control location-search-input"
          type="text"
          placeholder="e.g. Carlton"
          autocomplete="off"
          @focus="openSuggestions"
          @blur="closeSuggestions"
        />

        <ul
          v-if="showSuggestions"
          class="location-suggestion-list list-unstyled mb-0"
          role="listbox"
          aria-label="Location suggestions"
        >
          <li v-for="location in searchSuggestions" :key="location.id">
            <button class="location-suggestion-item" type="button" @mousedown.prevent="selectManualLocation(location)">
              {{ location.name }}
            </button>
          </li>
        </ul>
      </div>

      <p v-if="searchLoading" class="small text-secondary mt-2 mb-0">Searching locations...</p>
      <p v-if="searchError" class="small text-secondary mt-2 mb-0">{{ searchError }}</p>
    </section>

    <section
      class="soft-card prevention-card reveal-card p-3 p-md-4 mb-5"
      style="--reveal-delay: 120ms"
      aria-label="Skin type selector"
    >
      <h2 class="section-heading mb-1">Select Your Skin Type</h2>
      <p class="card-subtitle mb-3">Fitzpatrick skin type scale</p>

      <div class="skin-grid">
        <button
          v-for="type in SKIN_TYPES"
          :key="type.id"
          type="button"
          class="skin-card"
          :class="{ active: selectedSkinTypeId === type.id }"
          @click="selectedSkinTypeId = type.id"
        >
          <span class="skin-swatch" :style="{ background: type.tone }" aria-hidden="true"></span>
          <span class="skin-type-label">{{ type.label }}</span>
          <span class="skin-type-desc">{{ type.primaryText }}</span>
          <span class="skin-type-meta">{{ type.secondaryText }}</span>
        </button>
      </div>

      <p class="small text-secondary mt-3 mb-0 fw-semibold">All skin types require UV protection.</p>
    </section>

    <section
      class="soft-card prevention-card advice-focus-card reveal-card p-3 p-md-4 mb-5"
      style="--reveal-delay: 180ms"
      aria-label="Personalized sun advice"
    >
      <h2 class="section-heading mb-1">Personalised Sun Protection Advice</h2>
      <p class="card-subtitle mb-3">Based on today's UV and selected skin type</p>

      <Transition name="advice-fade" mode="out-in">
        <div :key="adviceTransitionKey" class="advice-panel">
          <p class="advice-summary mb-3">{{ personalisedAdvice.summary }}</p>
          <div class="advice-grid">
            <div class="advice-item">
              <span class="advice-icon" aria-hidden="true" v-html="ADVICE_ICONS.spf"></span>
              <span class="advice-label">Recommended SPF</span>
              <span class="advice-value">{{ personalisedAdvice.spf }}</span>
            </div>
            <div class="advice-item">
              <span class="advice-icon" aria-hidden="true" v-html="ADVICE_ICONS.exposure"></span>
              <span class="advice-label">Exposure guidance</span>
              <span class="advice-value">{{ personalisedAdvice.exposure }}</span>
            </div>
          </div>
        </div>
      </Transition>
    </section>

    <section
      id="sunscreen-guide"
      class="soft-card prevention-card reveal-card p-3 p-md-4 mb-5"
      style="--reveal-delay: 240ms"
      aria-label="Sunscreen guide"
    >
      <h2 class="section-heading mb-1">Sunscreen Guide</h2>
      <p class="card-subtitle mb-3">Recommended amount per body area</p>

      <div class="sunscreen-visual-list" role="list" aria-label="Sunscreen amount by body area">
        <article v-for="item in SUNSCREEN_GUIDE" :key="item.area" class="sunscreen-row" role="listitem">
          <span class="sunscreen-row-icon" aria-hidden="true" v-html="BODY_AREA_ICONS[item.icon]"></span>
          <div class="sunscreen-row-main">
            <h3 class="sunscreen-row-area mb-0">{{ item.area }}</h3>
            <p class="sunscreen-row-amount mb-0">{{ item.ml }} ml · {{ item.tsp }} tsp</p>
          </div>
          <span class="sunscreen-row-chip">{{ item.ml }} ml</span>
        </article>
      </div>

      <div class="guide-footer mt-3">
        <div class="guide-chip">Minimum per application: ~35 ml</div>
        <div class="guide-chip">Reapply every: 2 hours</div>
      </div>
    </section>

    <section
      id="suncare-timer"
      class="soft-card prevention-card reveal-card p-3 p-md-4 mb-5"
      style="--reveal-delay: 270ms"
      aria-label="SunCare Timer"
    >
      <div class="d-flex flex-wrap align-items-start justify-content-between gap-2 mb-2">
        <div>
          <h2 class="section-heading mb-1">SunCare Timer</h2>
          <p class="card-subtitle mb-0">Stay protected by reapplying sunscreen regularly.</p>
        </div>
        <span class="suggested-badge" aria-label="Suggested interval">Suggested</span>
      </div>

      <div class="timer-recommendation-card mb-3">
        <p class="timer-recommendation-label mb-1">UV-Based Recommendation</p>
        <p class="timer-recommendation-value mb-0">{{ recommendationMessage }}</p>
      </div>

      <div class="mb-3">
        <p class="timer-section-label mb-2">Preset Timer Options</p>
        <div class="preset-timer-row">
          <button
            v-for="preset in PRESET_TIMERS"
            :key="preset.minutes"
            type="button"
            class="preset-timer-pill"
            :class="{ active: selectedTimerMode === 'preset' && selectedPresetMinutes === preset.minutes }"
            @click="selectPresetTimer(preset.minutes)"
          >
            <span>{{ preset.label }}</span>
            <span v-if="isPresetSuggested(preset.minutes)" class="pill-suggested">Suggested</span>
          </button>
        </div>
      </div>

      <div class="mb-3">
        <p class="timer-section-label mb-2">Custom Timer Picker</p>
        <div class="timer-wheel-wrap" role="group" aria-label="Custom timer picker">
          <div class="timer-wheel-column">
            <p class="wheel-label">Hours</p>
            <div class="wheel-list" role="listbox" aria-label="Hours">
              <button
                v-for="hour in TIMER_HOUR_OPTIONS"
                :key="`hour-${hour}`"
                type="button"
                class="wheel-option"
                :class="{ active: customTimerHours === hour }"
                @click="selectCustomHour(hour)"
              >
                {{ hour }}
              </button>
            </div>
          </div>
          <div class="timer-wheel-column">
            <p class="wheel-label">Minutes</p>
            <div class="wheel-list" role="listbox" aria-label="Minutes">
              <button
                v-for="minute in TIMER_MINUTE_OPTIONS"
                :key="`minute-${minute}`"
                type="button"
                class="wheel-option"
                :class="{ active: customTimerMinutes === minute }"
                @click="selectCustomMinute(minute)"
              >
                {{ String(minute).padStart(2, '0') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="d-flex flex-wrap align-items-center gap-2 mb-3">
        <button class="start-reminder-btn" type="button" @click="startSuncareReminder">
          Start Reminder
        </button>
        <button
          v-if="timerRunning"
          class="stop-reminder-btn"
          type="button"
          @click="stopSuncareReminder"
        >
          Stop
        </button>
      </div>

      <div v-if="timerHasStarted" class="countdown-panel" role="status" aria-live="polite">
        <p class="countdown-label mb-1">Next sunscreen reminder</p>
        <p class="countdown-value mb-1">{{ formattedCountdown }}</p>
        <p class="countdown-helper mb-0">Reapply sunscreen to maintain protection.</p>
      </div>
    </section>

    <section
      id="protection-gear"
      class="soft-card prevention-card reveal-card p-3 p-md-4"
      style="--reveal-delay: 330ms"
      aria-label="Protection gear recommendations"
    >
      <h2 class="section-heading mb-1">Protection Gear Recommendations</h2>
      <p class="card-subtitle mb-3">Adapted to your UV risk and skin sensitivity</p>

      <div class="gear-grid">
        <article v-for="item in gearRecommendations" :key="item.title" class="gear-item">
          <span class="gear-icon" aria-hidden="true" v-html="item.iconSvg"></span>
          <h3 class="gear-title mb-1">{{ item.title }}</h3>
          <p class="gear-desc mb-0">{{ item.description }}</p>
        </article>
      </div>
    </section>

    <section class="soft-card p-3 p-md-4 mt-5" aria-label="UV test panel">
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <h2 class="test-heading mb-0">UV Test Panel</h2>
        <button class="btn btn-sm btn-outline-secondary" type="button" @click="clearUvOverride">
          Use Live UV
        </button>
      </div>

      <div class="d-flex flex-wrap gap-2 mb-3">
        <button
          v-for="value in presetUvValues"
          :key="value"
          class="btn btn-sm"
          :class="isActivePreset(value) ? 'btn-dark' : 'btn-outline-dark'"
          type="button"
          @click="setUvOverride(value)"
        >
          UV {{ value }}
        </button>
      </div>

      <form class="d-flex flex-wrap align-items-center gap-2" @submit.prevent="applyCustomUv">
        <label for="preventionCustomUv" class="small text-secondary fw-semibold">Custom UV</label>
        <input
          id="preventionCustomUv"
          v-model.number="customUvInput"
          class="form-control form-control-sm custom-uv-input"
          type="number"
          min="0"
          max="20"
          step="1"
        />
        <button class="btn btn-sm btn-primary" type="submit">Apply</button>
      </form>

      <p v-if="state.debugNote" class="small text-secondary mt-2 mb-0" role="status">
        {{ state.debugNote }}
      </p>
    </section>

    <div v-if="showReminderModal" class="timer-modal-backdrop" role="presentation">
      <div
        class="timer-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="timerModalTitle"
        aria-describedby="timerModalMessage"
      >
        <h3 id="timerModalTitle" class="timer-modal-title mb-2">Time to Reapply Sunscreen</h3>
        <p id="timerModalMessage" class="timer-modal-message mb-3">
          Protect your skin from UV exposure. Apply sunscreen again.
        </p>
        <button class="timer-modal-btn" type="button" @click="showReminderModal = false">OK</button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import UvHeroSection from "../components/UvHeroSection.vue";
import { useGeolocation } from "../composables/useGeolocation";
import { useLocationSearch } from "../composables/useLocationSearch";
import { getUvCategory, getUvColor, getUvShortMessage } from "../composables/useUvRules";
import { useUvData } from "../composables/useUvData";

const SAVED_LOCATION_KEY = "ss.selectedLocation";
const route = useRoute();

const FOCUS_TO_SECTION = {
  sunscreen: "sunscreen-guide",
  "sunscreen-guide": "sunscreen-guide",
  clothing: "protection-gear",
  "protection-gear": "protection-gear",
  reminder: "suncare-timer",
  "suncare-timer": "suncare-timer",
};

const state = reactive({
  loading: true,
  error: null,
  locationName: "Melbourne, Australia",
  latitude: -37.8136,
  longitude: 144.9631,
  currentUv: 6,
  uvCategory: "High",
  uvColor: "#f08c00",
  uvShortMessage: "Current risk: High",
  peakWindowText: "11:00 - 14:00",
  showLocationPrompt: false,
  liveCurrentUv: null,
  uvOverride: null,
  debugNote: "",
});

const searchQuery = ref("");
const searchSuggestions = ref([]);
const showSuggestions = ref(false);
const searchLoading = ref(false);
const searchError = ref("");
const skipNextSearch = ref(false);
const selectedSkinTypeId = ref(1);
const presetUvValues = [1, 4, 7, 9, 12];
const customUvInput = ref(6);
const PRESET_TIMERS = [
  { label: "1 hour", minutes: 60 },
  { label: "2 hours", minutes: 120 },
  { label: "3 hours", minutes: 180 },
];
const TIMER_HOUR_OPTIONS = Array.from({ length: 13 }, (_, idx) => idx);
const TIMER_MINUTE_OPTIONS = Array.from({ length: 59 }, (_, idx) => idx + 1);
const selectedTimerMode = ref("preset");
const selectedPresetMinutes = ref(120);
const customTimerHours = ref(1);
const customTimerMinutes = ref(30);
const countdownSeconds = ref(0);
const timerEndAt = ref(0);
const timerHasStarted = ref(false);
const showReminderModal = ref(false);
let searchTimer = null;
let searchToken = 0;
let reminderTicker = null;

const SKIN_TYPES = [
  {
    id: 1,
    label: "Type I",
    tone: "#f8e7dc",
    primaryText: "Very fair skin",
    secondaryText: "Always burns, never tans",
    sensitivity: "very-high",
  },
  {
    id: 2,
    label: "Type II",
    tone: "#f1d6bf",
    primaryText: "Fair skin",
    secondaryText: "Burns easily, minimal tanning",
    sensitivity: "high",
  },
  {
    id: 3,
    label: "Type III",
    tone: "#e3bc98",
    primaryText: "Medium skin",
    secondaryText: "Sometimes burns, gradually tans",
    sensitivity: "medium",
  },
  {
    id: 4,
    label: "Type IV",
    tone: "#c89269",
    primaryText: "Olive skin",
    secondaryText: "Rarely burns, tans easily",
    sensitivity: "medium-low",
  },
  {
    id: 5,
    label: "Type V",
    tone: "#9f6748",
    primaryText: "Brown skin",
    secondaryText: "Very rarely burns",
    sensitivity: "low",
  },
  {
    id: 6,
    label: "Type VI",
    tone: "#5e3a2e",
    primaryText: "Dark brown or black skin",
    secondaryText: "Almost never burns",
    sensitivity: "low",
  },
];

const SUNSCREEN_GUIDE = [
  { area: "Face & neck", icon: "face", ml: 5, tsp: 1 },
  { area: "Each arm", icon: "arm", ml: 5, tsp: 1 },
  { area: "Chest & abdomen", icon: "torso", ml: 7, tsp: 1.5 },
  { area: "Back", icon: "back", ml: 7, tsp: 1.5 },
  { area: "Each leg", icon: "leg", ml: 6, tsp: 1.25 },
];

const GEAR_ICONS = {
  hat: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 14.5C4 13.4 4.9 12.5 6 12.5H18C19.1 12.5 20 13.4 20 14.5C20 15.6 19.1 16.5 18 16.5H6C4.9 16.5 4 15.6 4 14.5Z" stroke="currentColor" stroke-width="1.7"/><path d="M8.5 12.5V10.8C8.5 8.9 10 7.5 12 7.5C14 7.5 15.5 8.9 15.5 10.8V12.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
  sunglasses: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.5 11H7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M17 11H20.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M9 11H15" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><rect x="4" y="9" width="6" height="5" rx="2.2" stroke="currentColor" stroke-width="1.7"/><rect x="14" y="9" width="6" height="5" rx="2.2" stroke="currentColor" stroke-width="1.7"/></svg>`,
  clothing: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 5.5L12 7.8L15 5.5L18.2 8V19H5.8V8L9 5.5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M9.3 10.2L7.2 12" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M14.7 10.2L16.8 12" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
  shade: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5.5V14.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M6.2 11.2C6.8 8.4 9.1 6.4 12 6.4C14.9 6.4 17.2 8.4 17.8 11.2H6.2Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M12 14.8V18.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M4 18.5H20" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
};

const ADVICE_ICONS = {
  spf: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3.8L18.5 6.2V11.4C18.5 15.3 16 18.8 12 20.2C8 18.8 5.5 15.3 5.5 11.4V6.2L12 3.8Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M9.6 11.9L11.2 13.6L14.6 10.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  exposure: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="4.1" stroke="currentColor" stroke-width="1.7"/><path d="M12 3.8V5.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M12 18.4V20.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M20.2 12H18.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M5.6 12H3.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M17.8 6.2L16.5 7.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M7.5 16.5L6.2 17.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M17.8 17.8L16.5 16.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M7.5 7.5L6.2 6.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
};

const BODY_AREA_ICONS = {
  face: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="10" r="4.5" stroke="currentColor" stroke-width="1.7"/><path d="M8.5 18.8C9.3 17.7 10.6 17 12 17C13.4 17 14.7 17.7 15.5 18.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
  arm: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.5 8.5C8.5 7.4 9.4 6.5 10.5 6.5H11.2C12.3 6.5 13.2 7.4 13.2 8.5V10.3L16.6 13.7C17.2 14.3 17.2 15.2 16.6 15.8L15.8 16.6C15.2 17.2 14.3 17.2 13.7 16.6L10.4 13.3H8.6C7.5 13.3 6.6 12.4 6.6 11.3V10.5C6.6 9.4 7.5 8.5 8.6 8.5H8.5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>`,
  torso: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.4 5.2L12 7.3L14.6 5.2L17 7.2V18.8H7V7.2L9.4 5.2Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>`,
  back: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.4 7.1C8.4 5.7 9.6 4.6 11 4.6H13C14.4 4.6 15.6 5.7 15.6 7.1V18.8H8.4V7.1Z" stroke="currentColor" stroke-width="1.7"/><path d="M9.7 10.2H14.3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
  leg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.2 5.5H14L13.2 11.3L14.8 18.5H11.8L10.2 11.3V5.5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>`,
};

const { getLocation, FALLBACK_LOCATION } = useGeolocation();
const { getUvData } = useUvData();
const { searchLocations } = useLocationSearch();

const selectedSkinType = computed(
  () => SKIN_TYPES.find((item) => item.id === selectedSkinTypeId.value) || SKIN_TYPES[0],
);

const adviceTransitionKey = computed(
  () => `${selectedSkinTypeId.value}-${state.uvCategory}-${Math.round(Number(state.currentUv || 0))}`,
);

const personalisedAdvice = computed(() => {
  const uv = Number(state.currentUv || 0);
  const category = state.uvCategory;
  const skinType = selectedSkinType.value;
  const isSensitive = skinType.sensitivity === "very-high" || skinType.sensitivity === "high";
  const spf = uv >= 8 || isSensitive ? "SPF 50+" : uv >= 6 ? "SPF 50" : uv >= 3 ? "SPF 30+" : "SPF 30";

  const summary =
    uv >= 8
      ? `Today's UV is ${category.toLowerCase()}. ${skinType.label} may burn more quickly under intense sun. Strong sun protection is recommended.`
      : uv >= 6
        ? `Today's UV is ${category.toLowerCase()}. ${skinType.label} should use consistent protection through midday.`
        : `Today's UV is ${category.toLowerCase()}. Keep daily protection habits, especially if outdoors for extended periods.`;

  const exposure =
    uv >= 8
      ? "Limit direct sun between peak hours. Seek shade and cover up whenever possible."
      : uv >= 6
        ? "Prefer short outdoor intervals and reapply sunscreen every 2 hours."
        : "Outdoor activity is generally manageable with routine protection.";

  return {
    summary,
    spf,
    exposure,
  };
});

const gearRecommendations = computed(() => {
  const uv = Number(state.currentUv || 0);
  const skinType = selectedSkinType.value;
  const strongerShadeTip = uv >= 8 || skinType.sensitivity === "very-high" || skinType.sensitivity === "high";

  return [
    {
      iconSvg: GEAR_ICONS.hat,
      title: "Wide-brim hat",
      description: "Minimum 7.5 cm brim to protect face, ears, and neck.",
    },
    {
      iconSvg: GEAR_ICONS.sunglasses,
      title: "UV-protective sunglasses",
      description: "Wrap-around style recommended with UV400 protection.",
    },
    {
      iconSvg: GEAR_ICONS.clothing,
      title: "Protective clothing",
      description: uv >= 6 ? "Long sleeves and UPF fabric are strongly recommended." : "Lightweight long-sleeve UPF clothing is preferred.",
    },
    {
      iconSvg: GEAR_ICONS.shade,
      title: "Seek shade",
      description: strongerShadeTip
        ? `Stay in shade during peak UV hours (${state.peakWindowText || "midday"}).`
        : "Seek shade when UV rises, especially around midday.",
    },
  ];
});

const recommendedIntervalMinutes = computed(() => {
  const uv = Number(state.currentUv || 0);

  if (uv < 3) {
    return null;
  }

  // Practical UV-based buckets: moderate -> 3h, high -> 2h, very high/extreme -> 1h.
  if (uv < 6) {
    return 180;
  }

  if (uv < 8) {
    return 120;
  }

  return 60;
});

function formatInterval(minutes) {
  const total = Math.max(0, Number(minutes || 0));
  const hour = Math.floor(total / 60);
  const minute = total % 60;

  if (hour > 0 && minute > 0) {
    return `${hour} ${hour === 1 ? "hour" : "hours"} ${minute} minutes`;
  }

  if (hour > 0) {
    return `${hour} ${hour === 1 ? "hour" : "hours"}`;
  }

  return `${minute} minutes`;
}

const recommendationMessage = computed(() => {
  const recommended = recommendedIntervalMinutes.value;
  if (recommended === null) {
    return "Recommended reminder based on today's UV: Optional reminder";
  }

  return `Recommended reminder based on today's UV: ${formatInterval(recommended)}`;
});

const timerRunning = computed(() => countdownSeconds.value > 0 && Boolean(reminderTicker));

const activeTimerTotalMinutes = computed(() => {
  if (selectedTimerMode.value === "custom") {
    return customTimerHours.value * 60 + customTimerMinutes.value;
  }
  return selectedPresetMinutes.value;
});

const formattedCountdown = computed(() => {
  const safeSeconds = Math.max(0, Number(countdownSeconds.value || 0));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
});

function isPresetSuggested(minutes) {
  return recommendedIntervalMinutes.value === minutes;
}

function selectPresetTimer(minutes) {
  selectedTimerMode.value = "preset";
  selectedPresetMinutes.value = minutes;
}

function selectCustomHour(hour) {
  selectedTimerMode.value = "custom";
  customTimerHours.value = hour;
}

function selectCustomMinute(minute) {
  selectedTimerMode.value = "custom";
  customTimerMinutes.value = minute;
}

function clearReminderTicker() {
  if (reminderTicker) {
    clearInterval(reminderTicker);
    reminderTicker = null;
  }
}

function stopSuncareReminder() {
  clearReminderTicker();
  timerEndAt.value = 0;
  countdownSeconds.value = 0;
}

function startSuncareReminder() {
  const totalMinutes = Math.max(0, Number(activeTimerTotalMinutes.value || 0));
  const totalSeconds = totalMinutes * 60;

  if (totalSeconds <= 0) {
    return;
  }

  clearReminderTicker();
  timerHasStarted.value = true;
  showReminderModal.value = false;
  timerEndAt.value = Date.now() + totalSeconds * 1000;
  countdownSeconds.value = totalSeconds;

  reminderTicker = setInterval(() => {
    const remaining = Math.max(0, Math.ceil((timerEndAt.value - Date.now()) / 1000));
    countdownSeconds.value = remaining;

    if (remaining <= 0) {
      clearReminderTicker();
      showReminderModal.value = true;
    }
  }, 1000);
}

function saveSelectedLocation(location) {
  try {
    const payload = {
      name: location?.name || FALLBACK_LOCATION.name,
      latitude: Number(location?.latitude),
      longitude: Number(location?.longitude),
    };

    if (!Number.isFinite(payload.latitude) || !Number.isFinite(payload.longitude)) {
      return;
    }

    window.localStorage.setItem(SAVED_LOCATION_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage failures.
  }
}

function readSavedLocation() {
  try {
    const raw = window.localStorage.getItem(SAVED_LOCATION_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    const latitude = Number(parsed?.latitude);
    const longitude = Number(parsed?.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return null;
    }

    return {
      name: parsed?.name || FALLBACK_LOCATION.name,
      latitude,
      longitude,
    };
  } catch {
    return null;
  }
}

function applyUvNarrative(uv) {
  state.currentUv = Number(uv || 0);
  state.uvCategory = getUvCategory(state.currentUv);
  state.uvColor = getUvColor(state.currentUv);
  state.uvShortMessage = getUvShortMessage(state.currentUv);
}

function getUvOverrideFromQuery() {
  const query = new URLSearchParams(window.location.search);
  const rawUv = query.get("uv");

  if (rawUv === null) {
    return null;
  }

  const parsed = Number(rawUv);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return Math.max(0, Math.min(20, parsed));
}

function updateUrlWithUv(uvValue) {
  const url = new URL(window.location.href);

  if (uvValue === null) {
    url.searchParams.delete("uv");
  } else {
    url.searchParams.set("uv", String(Math.round(uvValue)));
  }

  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}

function refreshUvPresentation() {
  const effectiveUv = state.uvOverride ?? state.liveCurrentUv ?? 0;
  applyUvNarrative(effectiveUv);

  if (state.uvOverride !== null) {
    state.debugNote = `Test mode: current UV is overridden by URL query (?uv=${Math.round(state.uvOverride)}).`;
  } else {
    state.debugNote = "";
  }
}

function setUvOverride(value) {
  state.uvOverride = Math.max(0, Math.min(20, Number(value) || 0));
  customUvInput.value = Math.round(state.uvOverride);
  updateUrlWithUv(state.uvOverride);
  refreshUvPresentation();
}

function clearUvOverride() {
  state.uvOverride = null;
  updateUrlWithUv(null);
  refreshUvPresentation();
}

function applyCustomUv() {
  setUvOverride(customUvInput.value);
}

function isActivePreset(value) {
  return state.uvOverride !== null && Math.round(state.uvOverride) === value;
}

async function applyLocationAndLoadUv(location) {
  state.loading = true;
  state.error = null;

  state.locationName = location.name;
  state.latitude = location.latitude;
  state.longitude = location.longitude;
  saveSelectedLocation(location);

  const uvData = await getUvData(state.latitude, state.longitude);
  state.liveCurrentUv = Number(uvData.currentUv || 0);
  customUvInput.value = Math.round(state.uvOverride ?? state.liveCurrentUv ?? 0);
  refreshUvPresentation();
  state.peakWindowText = uvData.peakWindowText || "11:00 - 14:00";

  if (uvData.error) {
    state.error = uvData.error;
  }

  state.loading = false;
}

async function useLiveLocation() {
  const location = await getLocation();
  state.showLocationPrompt = false;
  await applyLocationAndLoadUv(location);
}

async function selectManualLocation(location) {
  skipNextSearch.value = true;
  searchQuery.value = location.name;
  searchSuggestions.value = [];
  showSuggestions.value = false;
  searchError.value = "";
  state.showLocationPrompt = false;
  await applyLocationAndLoadUv(location);
}

function openSuggestions() {
  if (searchSuggestions.value.length > 0) {
    showSuggestions.value = true;
  }
}

function closeSuggestions() {
  window.setTimeout(() => {
    showSuggestions.value = false;
  }, 120);
}

watch(searchQuery, (value) => {
  if (skipNextSearch.value) {
    skipNextSearch.value = false;
    searchLoading.value = false;
    return;
  }

  const keyword = String(value || "").trim();
  searchError.value = "";

  if (searchTimer) {
    clearTimeout(searchTimer);
    searchTimer = null;
  }

  if (keyword.length < 2) {
    searchSuggestions.value = [];
    showSuggestions.value = false;
    searchLoading.value = false;
    return;
  }

  searchLoading.value = true;
  const token = ++searchToken;

  searchTimer = setTimeout(async () => {
    try {
      const results = await searchLocations(keyword);

      if (token !== searchToken) {
        return;
      }

      searchSuggestions.value = results;
      showSuggestions.value = results.length > 0;

      if (!results.length) {
        searchError.value = "No suburb found. Try another keyword.";
      }
    } catch (error) {
      if (token !== searchToken) {
        return;
      }

      searchSuggestions.value = [];
      showSuggestions.value = false;
      searchError.value = error?.message || "Unable to search locations.";
    } finally {
      if (token === searchToken) {
        searchLoading.value = false;
      }
    }
  }, 320);
});

async function loadPreventionData() {
  state.uvOverride = getUvOverrideFromQuery();
  customUvInput.value = Math.round(state.uvOverride ?? state.liveCurrentUv ?? 0);
  const storedLocation = readSavedLocation();

  if (storedLocation) {
    await applyLocationAndLoadUv(storedLocation);
    return;
  }

  state.showLocationPrompt = true;
  await applyLocationAndLoadUv(FALLBACK_LOCATION);
}

function resolveSectionId(hashValue, focusValue) {
  const cleanHash = String(hashValue || "").replace(/^#/, "").trim().toLowerCase();
  const cleanFocus = String(focusValue || "").trim().toLowerCase();

  return FOCUS_TO_SECTION[cleanHash] || FOCUS_TO_SECTION[cleanFocus] || "";
}

async function scrollToFocusedSection(hashValue, focusValue) {
  const sectionId = resolveSectionId(hashValue, focusValue);
  if (!sectionId) {
    return;
  }

  await nextTick();

  const target = document.getElementById(sectionId);
  if (!target) {
    return;
  }

  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

onBeforeUnmount(() => {
  if (searchTimer) {
    clearTimeout(searchTimer);
  }
  clearReminderTicker();
});

onMounted(() => {
  loadPreventionData();
  scrollToFocusedSection(route.hash, route.query.focus);
});

watch(
  () => [route.hash, route.query.focus],
  ([hash, focus]) => {
    scrollToFocusedSection(hash, focus);
  },
);
</script>

<style scoped>
.prevention-page {
  display: block;
  --accent-sun: #f4b35f;
  --accent-sky: #8cc8ff;
  --accent-leaf: #92d6b8;
}

.test-heading {
  font-size: 1rem;
  font-weight: 700;
}

.custom-uv-input {
  width: 90px;
}

.reveal-card {
  opacity: 0;
  transform: translate3d(0, 16px, 0) scale(0.995);
  animation: cardReveal 560ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  animation-delay: var(--reveal-delay, 0ms);
}

.prevention-card,
.location-prompt-card {
  border-radius: 28px;
  border: 1px solid rgba(19, 33, 59, 0.05);
  box-shadow: 0 16px 34px rgba(19, 33, 59, 0.08);
  transition: transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease;
}

.prevention-card:hover,
.location-prompt-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 36px rgba(19, 33, 59, 0.11);
  border-color: rgba(19, 33, 59, 0.08);
}

.card-subtitle,
.location-note {
  color: var(--ss-muted);
  font-size: 0.94rem;
}

.location-action {
  border: 0;
  background: transparent;
  color: rgba(21, 34, 56, 0.72);
  font-size: 0.86rem;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.location-action:hover {
  color: rgba(21, 34, 56, 0.95);
}

.location-search-wrap {
  position: relative;
}

.location-search-input {
  border-radius: 14px;
  border: 1px solid rgba(19, 33, 59, 0.12);
  background: rgba(255, 255, 255, 0.88);
}

.location-suggestion-list {
  position: absolute;
  z-index: 12;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  max-height: 220px;
  overflow-y: auto;
  border: 1px solid var(--ss-border);
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 12px 24px rgba(19, 33, 59, 0.12);
}

.location-suggestion-item {
  width: 100%;
  text-align: left;
  border: 0;
  background: transparent;
  padding: 0.58rem 0.78rem;
  color: var(--ss-text);
  font-size: 0.94rem;
}

.location-suggestion-item:hover {
  background: #f3f6fb;
}

.skin-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.85rem;
}

.skin-card {
  border: 1px solid rgba(19, 33, 59, 0.08);
  border-radius: 18px;
  padding: 0.85rem 0.8rem;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  gap: 0.22rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.skin-card:hover {
  transform: translateY(-2px);
  border-color: rgba(242, 163, 79, 0.52);
  box-shadow: 0 12px 24px rgba(19, 33, 59, 0.1);
}

.skin-card.active {
  border-color: rgba(237, 153, 66, 0.86);
  background: linear-gradient(180deg, rgba(255, 248, 238, 0.96), rgba(255, 255, 255, 0.98));
  box-shadow: 0 12px 26px rgba(236, 153, 66, 0.22);
}

.advice-focus-card {
  background:
    radial-gradient(circle at top right, rgba(140, 200, 255, 0.2), transparent 46%),
    radial-gradient(circle at bottom left, rgba(146, 214, 184, 0.16), transparent 42%),
    linear-gradient(180deg, rgba(255, 252, 247, 0.96), rgba(255, 255, 255, 0.99));
  border-color: rgba(244, 179, 95, 0.24);
  box-shadow: 0 18px 38px rgba(237, 168, 85, 0.18);
}

.skin-swatch {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.85);
  box-shadow: 0 4px 10px rgba(19, 33, 59, 0.15);
  margin-bottom: 0.18rem;
}

.skin-type-label {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--ss-text);
}

.skin-type-desc {
  font-size: 0.86rem;
  font-weight: 600;
  color: rgba(21, 34, 56, 0.84);
}

.skin-type-meta {
  font-size: 0.8rem;
  color: var(--ss-muted);
}

.advice-panel {
  border: 1px solid rgba(19, 33, 59, 0.07);
  border-radius: 20px;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.86);
  backdrop-filter: blur(3px);
}

.advice-fade-enter-active,
.advice-fade-leave-active {
  transition: opacity 0.28s ease, transform 0.28s ease;
}

.advice-fade-enter-from,
.advice-fade-leave-to {
  opacity: 0;
  transform: translateY(7px);
}

.advice-summary {
  color: rgba(21, 34, 56, 0.9);
  font-size: 1.06rem;
  line-height: 1.55;
  font-weight: 700;
}

.advice-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.7rem;
}

.advice-item {
  border-radius: 14px;
  padding: 0.78rem 0.8rem;
  background: #fff;
  border: 1px solid rgba(19, 33, 59, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.advice-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 18px rgba(19, 33, 59, 0.1);
}

.advice-icon {
  display: inline-flex;
  width: 27px;
  height: 27px;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  color: rgba(43, 76, 124, 0.88);
  background: linear-gradient(180deg, rgba(235, 246, 255, 0.96), rgba(245, 251, 255, 0.98));
  margin-bottom: 0.32rem;
}

.advice-icon :deep(svg) {
  width: 15px;
  height: 15px;
}

.advice-label {
  display: block;
  font-size: 0.75rem;
  color: var(--ss-muted);
  font-weight: 700;
  margin-bottom: 0.1rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.advice-value {
  display: block;
  color: var(--ss-text);
  font-size: 0.9rem;
  font-weight: 700;
}

.sunscreen-visual-list {
  display: grid;
  gap: 0.62rem;
}

.sunscreen-row {
  border: 1px solid rgba(19, 33, 59, 0.08);
  border-radius: 16px;
  padding: 0.62rem 0.72rem;
  background: #fff;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.sunscreen-row:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 18px rgba(19, 33, 59, 0.09);
}

.sunscreen-row-icon {
  width: 34px;
  height: 34px;
  border-radius: 11px;
  color: rgba(31, 61, 103, 0.86);
  background: linear-gradient(180deg, rgba(236, 247, 255, 0.95), rgba(246, 251, 255, 0.98));
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.sunscreen-row-icon :deep(svg) {
  width: 18px;
  height: 18px;
}

.sunscreen-row-main {
  min-width: 0;
}

.sunscreen-row-area {
  color: rgba(21, 34, 56, 0.9);
  font-size: 0.92rem;
  font-weight: 800;
}

.sunscreen-row-amount {
  color: var(--ss-muted);
  font-size: 0.84rem;
  font-weight: 600;
}

.sunscreen-row-chip {
  margin-left: auto;
  flex: 0 0 auto;
  border-radius: 999px;
  padding: 0.24rem 0.54rem;
  background: rgba(247, 251, 255, 0.96);
  border: 1px solid rgba(19, 33, 59, 0.1);
  color: rgba(21, 34, 56, 0.84);
  font-size: 0.78rem;
  font-weight: 700;
}

.guide-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.guide-chip {
  border-radius: 999px;
  padding: 0.35rem 0.72rem;
  background: linear-gradient(180deg, rgba(244, 250, 255, 0.95), rgba(248, 253, 250, 0.95));
  border: 1px solid rgba(140, 200, 255, 0.25);
  color: rgba(21, 34, 56, 0.82);
  font-size: 0.82rem;
  font-weight: 700;
}

.gear-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.8rem;
}

.gear-item {
  border: 1px solid rgba(19, 33, 59, 0.08);
  border-radius: 18px;
  padding: 0.8rem;
  background: #fff;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.gear-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(19, 33, 59, 0.1);
}

.gear-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: rgba(245, 248, 253, 0.95);
  margin-bottom: 0.38rem;
  color: rgba(55, 76, 112, 0.9);
}

.gear-icon :deep(svg) {
  width: 19px;
  height: 19px;
}

.gear-title {
  font-size: 0.92rem;
  font-weight: 800;
  color: var(--ss-text);
}

.gear-desc {
  font-size: 0.84rem;
  color: var(--ss-muted);
}

.suggested-badge,
.pill-suggested {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  color: rgba(31, 52, 85, 0.82);
  border: 1px solid rgba(19, 33, 59, 0.14);
  background: rgba(244, 248, 253, 0.98);
  padding: 0.18rem 0.5rem;
}

.timer-recommendation-card {
  border: 1px solid rgba(19, 33, 59, 0.08);
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(248, 251, 255, 0.96), rgba(255, 255, 255, 0.98));
  padding: 0.75rem 0.85rem;
}

.timer-recommendation-label,
.timer-section-label {
  color: var(--ss-muted);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.timer-recommendation-value {
  color: rgba(21, 34, 56, 0.88);
  font-size: 0.94rem;
  font-weight: 700;
}

.preset-timer-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.preset-timer-pill {
  border: 1px solid rgba(19, 33, 59, 0.14);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(249, 252, 255, 0.96));
  color: rgba(21, 34, 56, 0.9);
  border-radius: 999px;
  min-height: 40px;
  padding: 0.42rem 0.78rem;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.88rem;
  font-weight: 700;
  transition: all 0.2s ease;
}

.preset-timer-pill:hover {
  border-color: rgba(46, 70, 112, 0.34);
  box-shadow: 0 8px 18px rgba(19, 33, 59, 0.08);
}

.preset-timer-pill.active {
  border-color: rgba(140, 200, 255, 0.6);
  background: linear-gradient(180deg, rgba(234, 246, 255, 0.95), rgba(244, 251, 255, 0.97));
  box-shadow: 0 10px 20px rgba(67, 131, 193, 0.14);
}

.timer-wheel-wrap {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.timer-wheel-column {
  border: 1px solid rgba(19, 33, 59, 0.08);
  border-radius: 18px;
  background: rgba(250, 252, 255, 0.95);
  padding: 0.6rem;
}

.wheel-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--ss-muted);
  margin-bottom: 0.45rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.wheel-list {
  max-height: 148px;
  overflow-y: auto;
  scrollbar-width: thin;
  scroll-snap-type: y mandatory;
  padding-right: 0.2rem;
}

.wheel-option {
  width: 100%;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: rgba(21, 34, 56, 0.82);
  font-size: 0.9rem;
  font-weight: 700;
  padding: 0.48rem 0.55rem;
  text-align: center;
  scroll-snap-align: center;
  transition: all 0.18s ease;
}

.wheel-option:hover {
  background: rgba(236, 243, 252, 0.8);
}

.wheel-option.active {
  background: #fff;
  color: var(--ss-text);
  box-shadow: 0 6px 14px rgba(19, 33, 59, 0.08);
}

.start-reminder-btn,
.stop-reminder-btn,
.timer-modal-btn {
  border-radius: 999px;
  border: 0;
  min-height: 42px;
  padding: 0.42rem 1.15rem;
  font-size: 0.88rem;
  font-weight: 700;
}

.start-reminder-btn,
.timer-modal-btn {
  background: linear-gradient(135deg, rgba(244, 179, 95, 0.96), rgba(131, 196, 255, 0.94));
  color: #fff;
  box-shadow: 0 10px 18px rgba(90, 142, 194, 0.24);
}

.start-reminder-btn:hover,
.timer-modal-btn:hover {
  transform: translateY(-1px) scale(1.01);
}

.stop-reminder-btn {
  background: rgba(243, 246, 251, 0.95);
  color: rgba(21, 34, 56, 0.86);
  border: 1px solid rgba(19, 33, 59, 0.12);
}

.countdown-panel {
  border-radius: 18px;
  border: 1px solid rgba(19, 33, 59, 0.08);
  background: rgba(252, 253, 255, 0.98);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
  padding: 0.78rem 0.9rem;
}

.countdown-label {
  color: var(--ss-muted);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.countdown-value {
  color: rgba(21, 34, 56, 0.93);
  font-size: clamp(1.5rem, 3.4vw, 2rem);
  font-weight: 800;
  letter-spacing: 0.04em;
}

.countdown-helper {
  color: var(--ss-muted);
  font-size: 0.87rem;
  font-weight: 600;
}

.timer-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(17, 29, 48, 0.34);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
}

.timer-modal {
  width: min(92vw, 420px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.55);
  background: linear-gradient(180deg, rgba(248, 252, 255, 0.96), rgba(255, 255, 255, 0.98));
  box-shadow: 0 24px 40px rgba(19, 33, 59, 0.24);
  padding: 1rem 1rem 1.05rem;
}

.timer-modal-title {
  color: var(--ss-text);
  font-size: 1.08rem;
  font-weight: 800;
}

.timer-modal-message {
  color: var(--ss-muted);
  font-size: 0.92rem;
  font-weight: 600;
}

@keyframes cardReveal {
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
}

@media (max-width: 991px) {
  .skin-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767px) {
  .prevention-card,
  .location-prompt-card {
    border-radius: 24px;
  }

  .sunscreen-row {
    align-items: flex-start;
  }

  .sunscreen-row-chip {
    margin-left: 0;
  }

  .timer-wheel-wrap {
    grid-template-columns: minmax(0, 1fr);
  }

  .advice-grid,
  .gear-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 520px) {
  .skin-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (prefers-reduced-motion: reduce) {
  .reveal-card {
    animation: none;
    opacity: 1;
    transform: none;
  }

  .advice-fade-enter-active,
  .advice-fade-leave-active {
    transition: none;
  }
}
</style>
