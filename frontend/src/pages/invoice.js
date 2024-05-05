import "/style.css";
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const gAPIKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
import { loadNavbar } from "../components/navbar.js";
loadNavbar();

// Event listener for job dropdown
document.getElementById("job-dropdown").addEventListener("change", function () {
  const selectedJobId = this.value;
  fetch(`api/jobs/${selectedJobId}`)
    .then((response) => response.json())
    .then((job) => {
      document.getElementById("job-name").textContent = job.name;
      document.getElementById("start-date").textContent = job.startDate;
      document.getElementById("end-date").textContent = job.endDate;
      document.getElementById("client").textContent = job.client;
      document.getElementById("rate").textContent = job.rate;
      document.getElementById("location").textContent = job.location;
      document.getElementById("job-code").textContent = job.code;
      document.getElementById("hours-st").textContent = job.stHours;
    })
    .catch((error) => console.error("Error loading job details:", error));
});

// Example of loading jobs into the dropdown
const loadJobs = function () {
  fetch("api/jobs?isInvoiced=false") // Your API endpoint to fetch jobs
    .then((response) => response.json())
    .then((jobs) => {
      const select = document.getElementById("job-dropdown");
      jobs.forEach((job) => {
        const option = document.createElement("option");
        option.value = job.id;
        option.textContent = job.name;
        select.appendChild(option);
      });
    })
    .catch((error) => console.error("Error loading jobs:", error));
};
