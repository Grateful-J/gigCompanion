import "/style.css";
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const url = apiBaseUrl + "/api";
import { loadNavbar } from "../components/navbar.js";
loadNavbar();

//Fetches and displays jobs to job table
let globalJobs;
let isEditing = false;
let editingJobID = "";

//GET all jobs
async function fetchJobs() {
  try {
    const response = await fetch(`${url}/jobs`);
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
  const location = document.querySelector("#location").value;
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
    const response = await fetch(`${url}/jobs`, {
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
    const response = await fetch(`${url}/jobs/${id}`, {
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

  // get job data
  try {
    const response = await fetch(`${url}/jobs/${id}`);
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
    document.querySelector("#location").value = job.location;
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
    resetForm();
  });

  // clear job variable
  job = {};
}

// Function to PATCH job
async function updateJob(id) {
  const jobName = document.querySelector("#job-name").value;
  const client = document.querySelector("#client").value;
  const location = document.querySelector("#location").value;
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
    const response = await fetch(`${url}/jobs/${id}`, {
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
