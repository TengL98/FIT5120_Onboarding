<template>
  <div>
    <UvHeroSection
      :location-name="state.locationName"
      :current-uv="state.currentUv"
      :uv-category="state.uvCategory"
      :uv-short-message="state.uvShortMessage"
      :uv-color="state.uvColor"
      :loading="state.loading"
      :search-query="searchQuery"
      :search-suggestions="searchSuggestions"
      :show-suggestions="showSuggestions"
      :search-loading="searchLoading"
      :search-error="searchError"
      :location-mode="state.locationMode"
      @update:search-query="onSearchQueryUpdate"
      @open-suggestions="openSuggestions"
      @close-suggestions="closeSuggestions"
      @use-current-location="useLiveLocation"
      @select-location="selectManualLocation"
    />

    <UvSummaryCard
      :location-name="state.locationName"
      :current-uv="state.currentUv"
      :uv-category="state.uvCategory"
      :uv-long-advice="state.uvLongAdvice"
      :uv-color="state.uvColor"
      :weekday="state.weekday"
      :today-date="state.todayDate"
      :peak-window-text="state.peakWindowText"
      :safe-window-text="state.safeWindowText"
      :loading="state.loading"
    />

    <UvTrendCard :times="state.hourlyTimes" :values="state.hourlyUv" :loading="state.loading" />

    <QuickActionGrid />
    <FooterTip />

    <p v-if="state.error" class="text-center text-secondary mt-3 mb-0 small" role="status">
      {{ state.error }}
    </p>

    <p v-if="state.debugNote" class="text-center text-secondary mt-2 mb-0 small" role="status">
      {{ state.debugNote }}
    </p>

    <section class="soft-card p-3 p-md-4 mt-4" aria-label="UV test panel">
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
        <label for="customUv" class="small text-secondary fw-semibold">Custom UV</label>
        <input
          id="customUv"
          v-model.number="customUvInput"
          class="form-control form-control-sm custom-uv-input"
          type="number"
          min="0"
          max="20"
          step="1"
        />
        <button class="btn btn-sm btn-primary" type="submit">Apply</button>
      </form>
    </section>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import FooterTip from "../components/FooterTip.vue";
import QuickActionGrid from "../components/QuickActionGrid.vue";
import UvHeroSection from "../components/UvHeroSection.vue";
import UvSummaryCard from "../components/UvSummaryCard.vue";
import UvTrendCard from "../components/UvTrendCard.vue";
import { useGeolocation } from "../composables/useGeolocation";
import { useLocationSearch } from "../composables/useLocationSearch";
import {
  getUvCategory,
  getUvColor,
  getUvLongAdvice,
  getUvShortMessage,
} from "../composables/useUvRules";
import { useUvData } from "../composables/useUvData";

const state = reactive({
  loading: true,
  error: null,
  locationName: "Melbourne, Australia",
  latitude: null,
  longitude: null,
  currentUv: 6,
  uvCategory: "High",
  uvColor: "#f08c00",
  uvShortMessage: "Current risk: High",
  uvLongAdvice:
    "Apply SPF 30+ sunscreen, wear protective clothing, and reduce direct exposure during midday.",
  weekday: "",
  todayDate: "",
  peakWindowText: "",
  safeWindowText: "",
  hourlyTimes: [],
  hourlyUv: [],
  debugNote: "",
  liveCurrentUv: null,
  uvOverride: null,
  locationMode: "live",
});

const presetUvValues = [1, 4, 7, 9, 12];
const customUvInput = ref(6);
const searchQuery = ref("");
const searchSuggestions = ref([]);
const showSuggestions = ref(false);
const searchLoading = ref(false);
const searchError = ref("");
const skipNextSearch = ref(false);
let searchTimer = null;
let searchToken = 0;

const { getLocation } = useGeolocation();
const { getUvData } = useUvData();
const { searchLocations } = useLocationSearch();

function applyUvNarrative(uv) {
  state.uvCategory = getUvCategory(uv);
  state.uvColor = getUvColor(uv);
  state.uvShortMessage = getUvShortMessage(uv);
  state.uvLongAdvice = getUvLongAdvice(uv);
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
  state.currentUv = effectiveUv;
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

async function loadHomeData() {
  state.uvOverride = getUvOverrideFromQuery();
  customUvInput.value = Math.round(state.uvOverride ?? state.liveCurrentUv ?? 0);
  await useLiveLocation();
}

async function applyLocationAndLoadUv(location, mode) {
  state.loading = true;
  state.error = null;
  state.debugNote = "";

  state.locationMode = mode;
  state.locationName = location.name;
  state.latitude = location.latitude;
  state.longitude = location.longitude;

  const uvData = await getUvData(state.latitude, state.longitude);

  state.liveCurrentUv = Number(uvData.currentUv || 0);
  customUvInput.value = Math.round(state.uvOverride ?? state.liveCurrentUv ?? 0);

  state.weekday = uvData.weekday || "";
  state.todayDate = uvData.todayDate || "";
  state.peakWindowText = uvData.peakWindowText || "No data";
  state.safeWindowText = uvData.safeWindowText || "No data";
  state.hourlyTimes = uvData.hourlyTimes || [];
  state.hourlyUv = uvData.hourlyUv || [];

  refreshUvPresentation();

  if (location?.error || uvData.error) {
    state.error = [location?.error, uvData.error].filter(Boolean).join(" ");
  }

  state.loading = false;
}

async function useLiveLocation() {
  const location = await getLocation();
  await applyLocationAndLoadUv(location, "live");
}

async function selectManualLocation(location) {
  skipNextSearch.value = true;
  searchQuery.value = location.name;
  searchSuggestions.value = [];
  showSuggestions.value = false;
  searchError.value = "";

  await applyLocationAndLoadUv(location, "manual");
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

function onSearchQueryUpdate(value) {
  searchQuery.value = value;
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

onBeforeUnmount(() => {
  if (searchTimer) {
    clearTimeout(searchTimer);
  }
});

onMounted(() => {
  loadHomeData();
});
</script>

<style scoped>
.test-heading {
  font-size: 1rem;
  font-weight: 700;
}

.custom-uv-input {
  width: 90px;
}
</style>
