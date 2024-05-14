//Load Google Maps API
loader.importLibrary("places").then(async () => {
  const center = { lat: 50.064192, lng: -130.605469 };
  // Create a bounding box with sides ~10km away from the center point
  const defaultBounds = {
    north: center.lat + 0.1,
    south: center.lat - 0.1,
    east: center.lng + 0.1,
    west: center.lng - 0.1,
  };

  const input = document.getElementById("locationInput"); // Your input element for location

  const options = {
    bounds: defaultBounds,
    componentRestrictions: { country: "us" },
    fields: ["address_components", "geometry", "name", "adr_address"], // address_components, geometry, icon, name, adr_address
    strictBounds: false,
  };

  let autocomplete = new google.maps.places.Autocomplete(input, options);

  // Add event listener for place selection
  autocomplete.addListener("place_changed", () => {
    const selectedPlace = autocomplete.getPlace();
    console.log("Selected Place Object:", selectedPlace);
    // Do something with the selected place object

    // Address component Variables
    let streetNumber = selectedPlace.address_components[0].long_name;
    let streetName = selectedPlace.address_components[1].short_name;
    let city = selectedPlace.address_components[3].short_name;
    let state = selectedPlace.address_components[6].short_name;
    let postalCode = selectedPlace.address_components[7].long_name;
    let country = selectedPlace.address_components[5].long_name;

    currentState = state; //updates global variable for r2w logic

    //console log address examples
    console.log(`Street Number: ${streetNumber}`);
    console.log(`Street Name: ${streetName}`);
    console.log(`City: ${city}`);
    console.log(`State: ${state}`);
    console.log(`Postal Code: ${postalCode}`);
    console.log(`Country: ${country}`);
  });
});
