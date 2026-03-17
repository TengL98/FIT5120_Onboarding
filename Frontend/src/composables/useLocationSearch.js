function getPreferredName(address, fallbackName) {
  if (!address) {
    return fallbackName || "Selected location";
  }

  const suburb =
    address.suburb ||
    address.neighbourhood ||
    address.village ||
    address.town ||
    address.hamlet ||
    "";
  const city =
    address.city ||
    address.city_district ||
    address.municipality ||
    address.county ||
    address.state_district ||
    "";

  if (suburb && city) {
    return `${suburb}, ${city}`;
  }

  if (fallbackName && city && fallbackName !== city) {
    return `${fallbackName}, ${city}`;
  }

  return fallbackName || city || "Selected location";
}

export const INVALID_AU_SUBURB_MESSAGE = "This is not an Australian suburb. Please re-enter.";

function getSuburbText(address = {}) {
  return (
    address.suburb ||
    address.neighbourhood ||
    address.village ||
    address.town ||
    address.hamlet ||
    ""
  );
}

export function isValidAustralianSuburbInput(keyword) {
  const query = String(keyword || "").trim();
  if (query.length < 2) {
    return false;
  }

  // Allow letters, spaces, apostrophes, and hyphens only.
  return /^[A-Za-z\u00C0-\u024F' -]+$/.test(query);
}

export function useLocationSearch() {
  const searchLocations = async (keyword) => {
    const query = String(keyword || "").trim();
    if (query.length < 2) {
      return [];
    }

    const endpoint = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=jsonv2&addressdetails=1&limit=6&countrycodes=au`;
    const response = await fetch(endpoint, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Location search request failed.");
    }

    const payload = await response.json();
    if (!Array.isArray(payload)) {
      return [];
    }

    const unique = new Set();
    return payload
      .map((item) => {
        const address = item?.address || {};
        const suburb = getSuburbText(address);
        const city =
          address.city ||
          address.city_district ||
          address.municipality ||
          address.county ||
          address.state_district ||
          "";

        // Keep only entries with suburb-like address info.
        if (!suburb) {
          return null;
        }

        const latitude = Number(item?.lat);
        const longitude = Number(item?.lon);
        const key = `${latitude},${longitude}`;
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || unique.has(key)) {
          return null;
        }

        unique.add(key);
        return {
          id: key,
          name: getPreferredName(item?.address, item?.name),
          latitude,
          longitude,
        };
      })
      .filter(Boolean);
  };

  return {
    searchLocations,
  };
}
