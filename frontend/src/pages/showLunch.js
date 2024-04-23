import "/style.css";
import { Loader } from "@googlemaps/js-api-loader";
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const gAPIKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// TODO: Use Location data from /location endpoint to establish where the venue is

// TODO: import Google Places API

// Loads Google Maps API
const loader = new Loader({
  apiKey: gAPIKey,
  version: "weekly",
  libraries: ["places"],
  language: "en",
});

// Loads Places Library and options
loader.importLibrary("places").then(async () => {
  const center = { lat: 50.064192, lng: -130.605469 };
  // Create a bounding box with sides ~10km away from the center point
  const defaultBounds = {
    north: center.lat + 0.1,
    south: center.lat - 0.1,
    east: center.lng + 0.1,
    west: center.lng - 0.1,
  };

  // TODO: use the planned start time to calculate the time of lunch

  // TODO: use the follow google Places to filter lunch options
  const options = {
    bounds: defaultBounds,
    componentRestrictions: { country: "us" },
    fields: ["name", "opening_hours", "business_status", "geometry", "price_level", "rating", "reviews", "types", "vicinity"], // address_components, geometry, icon, name, adr_address
    strictBounds: false,
  };
});
//docs: https://developers.google.com/maps/documentation/javascript/reference/places-service#PlaceResult
