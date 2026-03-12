const FALLBACK_LOCATION = {
  name: "Melbourne, Australia",
  latitude: -37.8136,
  longitude: 144.9631,
};

async function resolveLocationLabel(latitude, longitude) {
  try {
    const endpoint = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=jsonv2&addressdetails=1`;
    const response = await fetch(endpoint, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Reverse geocoding request failed.");
    }

    const payload = await response.json();
    const address = payload?.address || {};
    const suburb = address.suburb || address.neighbourhood || address.town || "";
    const city =
      address.city ||
      address.county ||
      address.state_district ||
      address.state ||
      address.municipality ||
      "";

    if (suburb && city) {
      return `${suburb}, ${city}`;
    }

    if (city) {
      return city;
    }

    return "Current Location";
  } catch {
    return "Current Location";
  }
}

function geolocationNotAvailable() {
  return {
    ...FALLBACK_LOCATION,
    usedFallback: true,
    error: "Geolocation is not available in this browser.",
  };
}

function getCurrentPosition(options) {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

export function useGeolocation() {
  const getLocation = async () => {
    if (!("geolocation" in navigator)) {
      return geolocationNotAvailable();
    }

    try {
      const position = await getCurrentPosition({
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 10 * 60 * 1000,
      });

      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      const locationName = await resolveLocationLabel(latitude, longitude);

      return {
        name: locationName,
        latitude,
        longitude,
        usedFallback: false,
        error: null,
      };
    } catch (error) {
      return {
        ...FALLBACK_LOCATION,
        usedFallback: true,
        error: error?.message || "Unable to access current location.",
      };
    }
  };

  return {
    getLocation,
    FALLBACK_LOCATION,
  };
}
