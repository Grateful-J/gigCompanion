let apiBaseUrl;
import { loadNavbar } from "../components/navbar.js";
loadNavbar();

let currentState = ""; //to store autofilled state for form logic (is RTW or not)

// Google Maps API
import { Loader } from "@googlemaps/js-api-loader";
const gAPIKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
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

  const input = document.getElementById("location-input"); // Your input element for location

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
    let state = selectedPlace.address_components[5].short_name;
    let postalCode = selectedPlace.address_components[7].long_name || "";
    let country = selectedPlace.address_components[6].long_name || "";

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

//checks if env is dev or prod
if (import.meta.env.VITE_MODE === "dev") {
  apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
} else {
  apiBaseUrl = import.meta.env.VITE_API_BASE_URL_PROD;
}

console.log("API Base URL:", apiBaseUrl);

//Fetches and displays jobs to job table
let globalJobs;
let isEditing = false;
let editingJobID = "";

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

fetchJobs();

// Display Jobs
function displayJobs(jobs) {
  const container = document.querySelector("#jobs-container");
  container.innerHTML = ""; // Clear existing jobs

  jobs.forEach((job) => {
    const startDate = new Date(job.startDate);
    const endDate = new Date(job.endDate);
    const daysWorked = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    const row = document.createElement("tr");
    row.innerHTML = `
        <input type="hidden" class="job-id" value="${job._id}">
        <td class="border-b border-gray-200 p-2">${job.jobName}</td>
        <td class="border-b border-gray-200 p-2">${job.client}</td>
        <td class="border-b border-gray-200 p-2">${job.location}</td>
        <td class="border-b border-gray-200 p-2">${new Date(job.startDate).toLocaleDateString()}</td>
        <td class="border-b border-gray-200 p-2">${new Date(job.endDate).toLocaleDateString()}</td>
        <td class="border-b border-gray-200 p-2">${job.showCode}</td>
        <td class="border-b border-gray-200 p-2">${daysWorked}</td>
        <td class="border-b border-gray-200 p-2">${job.rate}</td>
        <td class="border-b border-gray-200 p-2">${job.isFreelance ? "Yes" : "No"}</td>
        <td class="border-b border-gray-200 p-2">${job.isLocal ? "Yes" : "No"}</td>
        <td class="border-b border-gray-200 p-2"><button class="edit-btn bg-blue-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full" data-id="${
          job._id
        }">Edit</button></td>
        <td class="border-b border-gray-200 p-2"><button class="delete-btn bg-blue-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full" data-id="${
          job._id
        }">Delete</button></td>
      `;
    container.appendChild(row);
  });
}

// Function to display job form
function displayJobForm() {
  const jobFormContainer = document.querySelector("#job-form-container");
  jobFormContainer.classList.remove("hidden");
  window.scrollTo(0, 0);
}

// Function to hide job form
function hideJobForm() {
  const jobFormContainer = document.querySelector("#job-form-container");
  jobFormContainer.classList.add("hidden");
}

// Function to clear job form
function clearJobForm() {
  const jobForm = document.querySelector("#job-form");
  jobForm.reset();
}

// Function to add job
async function submitNewJob() {
  const jobName = document.querySelector("#job-name").value;
  const client = document.querySelector("#client").value;
  const location = currentState || document.querySelector("#location-input").value;
  const startDate = document.querySelector("#start-date").value;
  const endDate = document.querySelector("#end-date").value;
  const showCode = document.querySelector("#show-code").value;
  const rate = document.querySelector("#rate").value;
  const isFreelance = document.querySelector("#is-freelance").value;
  const isLocal = document.querySelector("#is-local").value;
  const job = {
    jobName,
    client,
    location,
    startDate,
    endDate,
    showCode,
    rate,
    isFreelance,
    isLocal,
  };
  try {
    const response = await fetch(`${apiBaseUrl}/api/jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(job),
    });
    const data = await response.json();
    console.log(data);
    fetchJobs();
  } catch (error) {
    console.error("Failed to add job", error);
  } finally {
    // Clear input fields
    clearJobForm();

    // Alert and Hide job form
    alert("Job added successfully: ");
    hideJobForm();
  }
}

// Function to delete job
async function deleteJob(id) {
  try {
    const response = await fetch(`${apiBaseUrl}/api/jobs/${id}`, {
      method: "DELETE",
    });
    const data = await response.json();
    console.log(data);
    fetchJobs();
  } catch (error) {
    console.error("Failed to delete job", error);
  }
}

// Function to edit job
async function editJob(id) {
  let job = {};
  isEditing = true;
  editingJobID = id; // Make sure this is correctly assigned

  // get job data
  try {
    const response = await fetch(`${apiBaseUrl}/api/jobs/${id}`);
    job = await response.json();
    console.log(job);
  } catch (error) {
    console.error("Failed to edit job", error);
  } finally {
    // Display edit form
    displayJobForm();

    const startDate = new Date(job.startDate);
    const isoFormattedStartDate = startDate.toISOString().split("T")[0];
    const endDate = new Date(job.endDate);
    const isoFormattedEndDate = endDate.toISOString().split("T")[0];

    // Set values in edit form
    document.querySelector("#job-name").value = job.jobName;
    document.querySelector("#client").value = job.client;
    document.querySelector("#location-input").value = job.location;
    document.querySelector("#start-date").value = isoFormattedStartDate;
    document.querySelector("#end-date").value = isoFormattedEndDate;
    document.querySelector("#show-code").value = job.showCode;
    document.querySelector("#rate").value = job.rate;
    document.querySelector("#is-freelance").value = job.isFreelance;
    document.querySelector("#is-local").value = job.isLocal;
  }

  // Change submit button text to "Update Job"
  const submitBtn = document.querySelector('button[type="submit"]');
  submitBtn.textContent = "Update Job";

  // Add event listener to submit button
  submitBtn.addEventListener("click", () => {
    updateJob(id);
    //resetForm();
  });

  // clear job variable
  job = {};
}

// Function to PATCH job
async function updateJob(id) {
  const jobName = document.querySelector("#job-name").value;
  const client = document.querySelector("#client").value;
  const location = currentState || document.querySelector("#location-input").value;
  const startDate = document.querySelector("#start-date").value;
  const endDate = document.querySelector("#end-date").value;
  const showCode = document.querySelector("#show-code").value;
  const rate = document.querySelector("#rate").value;
  const isFreelance = document.querySelector("#is-freelance").value;
  const isLocal = document.querySelector("#is-local").value;
  const job = {
    jobName,
    client,
    location,
    startDate,
    endDate,
    showCode,
    rate,
    isFreelance,
    isLocal,
  };
  try {
    const response = await fetch(`${apiBaseUrl}/api/jobs/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(job),
    });
    const data = await response.json();
    console.log(data);
    fetchJobs();
  } catch (error) {
    console.error("Failed to update job", error);
  } finally {
    // Clear input fields
    clearJobForm();
    isEditing = false;
  }
}

// event listener for add job button to display add job form
document.querySelector("#add-job-btn").addEventListener("click", displayJobForm);

//event listener for delete button to delete job
document.querySelector("#jobs-table").addEventListener("click", (event) => {
  if (event.target.classList.contains("delete-btn")) {
    const id = event.target.getAttribute("data-id");

    // confirm user wants to delete
    if (confirm("Are you sure you want to delete this job?")) {
      deleteJob(id);
    } else {
      return;
    }
  }
});

//event listener for edit button to edit job
document.querySelector("#jobs-table").addEventListener("click", (event) => {
  if (event.target.classList.contains("edit-btn")) {
    const id = event.target.getAttribute("data-id");
    editJob(id);
  }
});

// event listener for submit button to submit job if isEditing is false
document.querySelector('button[type="submit"]').addEventListener("click", () => {
  if (!isEditing) {
    submitNewJob();
  } else {
    updateJob(editingJobID);
  }
});

// Function to display previous jobs in table
function displayPreviousJobs(jobs) {
  const jobsContainer = document.querySelector("#previous-jobs-container");
  jobsContainer.innerHTML = "";
  jobs.forEach((job) => {
    const jobRow = document.createElement("tr");
    jobRow.innerHTML = `
      <td class="p-2 border-b border-gray-600">${job.jobName}</td>
      <td class="p-2 border-b border-gray-600">${job.client}</td>
      <td class="p-2 border-b border-gray-600">${job.location}</td>
      <td class="p-2 border-b border-gray-600">${job.startDate}</td>
      <td class="p-2 border-b border-gray-600">${job.endDate}</td>
      <td class="p-2 border-b border-gray-600">${job.showCode}</td>
      <td class="p-2 border-b border-gray-600">${job.daysWorked}</td>
      <td class="p-2 border-b border-gray-600">${job.rate}</td>
      <td class="p-2 border-b border-gray-600">${job.isFreelance}</td>
      <td class="p-2 border-b border-gray-600">${job.isLocal}</td>
      <td class="p-2 border-b border-gray-600">
        <button class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full delete-btn" data-id="${job._id}">Delete</button>
      </td> 
      <td class="p-2 border-b border-gray-600">
        <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full edit-btn" data-id="${job._id}">Edit</button>
      </td>
    `;
    jobsContainer.appendChild(jobRow);
  });
}

// event listener to display previous jobs
document.querySelector("#previous-jobs-btn").addEventListener("click", async () => {
  const response = await fetch(`${url}/jobs`);
  const jobs = await response.json();
  console.log(`Loading Previous Jobs: ${jobs}`);

  const previousJobFormContainer = document.querySelector("#previous-jobs");
  previousJobFormContainer.classList.remove("hidden");

  displayPreviousJobs(jobs);
});

// TODO: only fetch jobs that are not submitted or invoiced

// TODO: add travel/work checkbox to edit
// TODO: figure out how to calculate the travel/work sandwich days
