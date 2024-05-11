import { Loader } from "@googlemaps/js-api-loader";
let apiBaseUrl;
const gAPIKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
import { loadNavbar } from "../components/navbar.js";
loadNavbar();

//checks if env is dev or prod
if (import.meta.env.VITE_MODE === "dev") {
  apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
} else {
  apiBaseUrl = import.meta.env.VITE_API_BASE_URL_PROD;
}

//Global variable for jobs
let globalJobs = [];

//Global variable to track the editing state
let isEditing = false;
let editingJobID = "";

//Global variable for storing address
let currentState = ""; //to store autofilled state for form logic (is RTW or not)

// Loads Google Maps API
const loader = new Loader({
  apiKey: gAPIKey,
  version: "weekly",
  libraries: ["places"],
  language: "en",
});

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

//On page load fetch jobs & listens for form submit
fetchJobs();
document.querySelector("#job-form").addEventListener("submit", addorUpdateJob); // Event Listener For on submit to addJob or updateJob

// Event Listener for Edits or Deletes
document.querySelector("#jobs-container").addEventListener("click", (event) => {
  if (event.target.classList.contains("delete-btn")) {
    const jobId = event.target.getAttribute("data-id");
    deleteJob(jobId);
  } else if (event.target.classList.contains("edit-btn")) {
    const jobId = event.target.getAttribute("data-id");
    const job = globalJobs.find((job) => job._id === jobId);
    editJob(job);
  }
});

// Add minimum value to endDate based on startDate
document.querySelector("#startDate").addEventListener("change", () => {
  const startDate = document.querySelector("#startDate").value;
  const endDate = document.querySelector("#endDate");
  endDate.min = startDate;
});

async function addorUpdateJob(event) {
  event.preventDefault();

  // Get values from form
  const job = {
    jobName: document.querySelector("#jobName").value,
    client: document.querySelector("#client").value,
    location: currentState,
    startDate: document.querySelector("#startDate").value,
    endDate: document.querySelector("#endDate").value,
    //TODO: travelDays: document.querySelector("#travelDays").value,
    //TODO: isRTW: document.querySelector("#isRTW").checked,
  };

  let url = `${apiBaseUrl}/api/jobs`;
  let method = "POST";
  if (isEditing) {
    url = `${apiBaseUrl}/api/jobs/${editingJobID}`;
    method = "PATCH";
  }

  // Add or update job to database
  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(job),
    });

    if (response.ok) {
      console.log(isEditing ? "Job updated" : "Job added");
      resetForm();
      fetchJobs();
    } else {
      console.error(isEditing ? "Failed to update job" : "Failed to add job");
    }
  } catch (error) {
    console.error("Failed to add job", error);
  }
}

//GET all jobs
async function fetchJobs() {
  try {
    const response = await fetch(`${apiBaseUrl}/api/jobs`);
    const jobs = await response.json();
    globalJobs = jobs; //update global variable
    console.log(`fetched jobs: ${globalJobs[0]}`);
    displayJobs(jobs);
  } catch (error) {
    console.error("Failed to fetch jobs", error);
  }
}

//TODO: Fix math on counters. upper counters dont match rtw day math
//Displays Counter of Right to Work days
function updateCounters(jobs) {
  let rtwDays = 0;
  let nonRtwDays = 0;

  jobs.forEach((job) => {
    const startDate = new Date(job.startDate);
    const endDate = new Date(job.endDate);
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    if (job.isRTW) {
      rtwDays += days;
    } else {
      nonRtwDays += days;
    }
  });

  document.getElementById("rtw-counter").textContent = `RTW Days: ${rtwDays}`;
  document.getElementById("non-rtw-counter").textContent = `Non-RTW Days: ${nonRtwDays}`;
}

// Delete Job
async function deleteJob(jobId) {
  //Ask user if confirm delete
  const isDeleteConfirmed = confirm("Are you sure you want to delete this job?");
  if (!isDeleteConfirmed) {
    return; // Exit the function if user cancels
  }

  try {
    const response = await fetch(`${apiBaseUrl}/api/jobs/${jobId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      console.log("Job deleted successfully");
      fetchJobs(); // Re-fetch jobs to update the list
    } else {
      console.error("Failed to delete job");
    }
  } catch (error) {
    console.error("Failed to delete job", error);
  }
}

//Display Jobs
function displayJobs(jobs) {
  const container = document.querySelector("#jobs-container");
  container.innerHTML = ""; // Clear existing jobs

  jobs.forEach((job) => {
    const startDate = new Date(job.startDate);
    const endDate = new Date(job.endDate);
    const daysWorked = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    const row = container.insertRow();
    row.innerHTML = `
  <td class="border-b border-gray-200 p-2">${job.jobName}</td>
  <td class="border-b border-gray-200 p-2">${job.client}</td>
  <td class="border-b border-gray-200 p-2">${job.location}</td>
  <td class="border-b border-gray-200 p-2">${new Date(job.startDate).toLocaleDateString()}</td>
  <td class="border-b border-gray-200 p-2">${new Date(job.endDate).toLocaleDateString()}</td>
  <td class="border-b border-gray-200 p-2">${job.isRTW ? "Yes" : "No"}</td>
  <td class="border-b border-gray-200 p-2">${daysWorked}</td>
  <td class="border-b border-gray-200 p-2"><button class="edit-btn bg-blue-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full" data-id="${
    job._id
  }">Edit</button></td>
  <td class="border-b border-gray-200 p-2"><button class="delete-btn bg-blue-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full" data-id="${
    job._id
  }">Delete</button></td>
`;
  });

  updateCounters(jobs);
}

//Edit Job
async function editJob(job) {
  //Change submit button text to "Update Job"
  const submitBtn = document.querySelector('button[type="submit"]');
  submitBtn.textContent = "Update Job";

  const startDate = new Date(job.startDate);
  const isoFormattedStartDate = startDate.toISOString().split("T")[0];
  const endDate = new Date(job.endDate);
  const isoFormattedEndDate = endDate.toISOString().split("T")[0];

  //Populates the form with job data
  document.querySelector("#jobName").value = job.jobName;
  document.querySelector("#client").value = job.client;
  document.querySelector("#location").value = job.location;
  document.querySelector("#startDate").value = isoFormattedStartDate;
  document.querySelector("#endDate").value = isoFormattedEndDate;
  //document.querySelector("#travelDays").value = job.travelDays;
  //document.querySelector("#isRTW").checked = job.isRTW;

  //Set editing state
  isEditing = true;
  editingJobID = job._id;

  //Snap to top of window
  window.scrollTo(0, 0);
}
//Reset Form
function resetForm() {
  document.querySelector("#job-form").reset();
  isEditing = false;
  editingJobID = "";

  //Change submit button back to "Add Job"
  const submitBtn = document.querySelector('button[type="submit"]');
  submitBtn.textContent = "Add Job";
}

//TODO add pagation to cycle through jobs
