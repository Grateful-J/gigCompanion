import "/style.css";
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const url = apiBaseUrl + "/api";
import { loadNavbar } from "../components/navbar.js";
loadNavbar();

// Example of loading jobs into the dropdown
const loadJobs = function () {
  fetch(url + "/jobs") // Your API endpoint to fetch jobs
    .then((response) => response.json())
    .then((jobs) => {
      const select = document.getElementById("job-dropdown");
      jobs.forEach((job) => {
        const option = document.createElement("option");
        option.value = job._id;
        option.textContent = job.jobName;
        select.appendChild(option);
      });
    })
    .catch((error) => console.error("Error loading jobs:", error));
};

loadJobs();

// Event listener for job dropdown
document.getElementById("job-dropdown").addEventListener("change", function () {
  const selectedJobId = this.value;
  let startDate = new Date();
  let endDate = new Date();
  console.log(`Selected job ID: ${selectedJobId}`);
  fetch(`${url}/jobs/${selectedJobId}`)
    .then((response) => response.json())
    .then((job) => {
      document.getElementById("job-name").textContent = job.jobName;
      document.getElementById("start-date").textContent = job.startDate;
      document.getElementById("end-date").textContent = job.endDate;
      document.getElementById("client").textContent = job.client;
      document.getElementById("rate").textContent = job.rate;
      document.getElementById("location").textContent = job.location;
      //document.getElementById("job-code").textContent = job.code || "N/A";
      //document.getElementById("hours-st").textContent = job.stHours;
    })
    .catch((error) => console.error("Error loading job details:", error));
});
