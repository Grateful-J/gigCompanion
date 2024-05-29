let apiBaseUrl;
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
let currentPage = 1;
const jobsPerPage = 5;

//GET all jobs
async function fetchJobs() {
  try {
    const response = await fetch(`${apiBaseUrl}/api/jobs`);
    const jobs = await response.json();
    globalJobs = jobs; //update global variable
    console.log(`fetched jobs: ${globalJobs[0]}`);
    displayJobs(jobs);
    updatePagination();
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
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1; // Include end date
    if (job.isRTW) {
      rtwDays += days;
    } else {
      nonRtwDays += days;
    }
  });

  document.getElementById("rtw-counter").textContent = `RTW Days: ${rtwDays}`;
  document.getElementById("non-rtw-counter").textContent = `Non-RTW Days: ${nonRtwDays}`;
}

//Display Jobs
function displayJobs(jobs) {
  const container = document.querySelector("#jobs-container");
  container.innerHTML = ""; // Clear existing jobs

  const start = (currentPage - 1) * jobsPerPage;
  const end = start + jobsPerPage;
  const paginatedJobs = jobs.slice(start, end);

  paginatedJobs.forEach((job) => {
    const startDate = new Date(job.startDate);
    const endDate = new Date(job.endDate);
    const daysWorked = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    const jobCard = document.createElement("div");
    jobCard.classList.add(
      "bg-gray-700",
      "text-gray-200",
      "p-4",
      "rounded-lg",
      "shadow-md",
      "flex",
      "flex-col",
      "space-y-2",
      "sm:space-y-0",
      "sm:flex-row",
      "sm:justify-between",
      "sm:items-center"
    );

    jobCard.innerHTML = `
      <div class="flex-1">
        <span class="block font-semibold">Job Name:</span> ${job.jobName}
      </div>
      <div class="flex-1">
        <span class="block font-semibold">Client:</span> ${job.client}
      </div>
      <div class="flex-1">
        <span class="block font-semibold">State:</span> ${job.location}
      </div>
      <div class="flex-1">
        <span class="block font-semibold">Start Date:</span> ${new Date(job.startDate).toLocaleDateString()}
      </div>
      <div class="flex-1">
        <span class="block font-semibold">End Date:</span> ${new Date(job.endDate).toLocaleDateString()}
      </div>
      <div class="flex-1">
        <span class="block font-semibold">RTW:</span> ${job.isRTW ? "Yes" : "No"}
      </div>
      <div class="flex-1">
        <span class="block font-semibold">Days Worked:</span> ${daysWorked}
      </div>
      <div class="flex-1 flex space-x-2">
        <button class="edit-btn bg-blue-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full" data-id="${job._id}">Edit</button>
        <button class="delete-btn bg-blue-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full" data-id="${job._id}">Delete</button>
      </div>
    `;

    container.appendChild(jobCard);
  });

  updateCounters(jobs);
}

// Update pagination buttons
function updatePagination() {
  const totalPages = Math.ceil(globalJobs.length / jobsPerPage);
  document.getElementById("prev-page").disabled = currentPage === 1;
  document.getElementById("next-page").disabled = currentPage === totalPages;
}

// Event listeners for pagination buttons
document.getElementById("prev-page").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    displayJobs(globalJobs);
    updatePagination();
  }
});

document.getElementById("next-page").addEventListener("click", () => {
  const totalPages = Math.ceil(globalJobs.length / jobsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    displayJobs(globalJobs);
    updatePagination();
  }
});

// Fetch jobs on page load
fetchJobs();
