let apiBaseUrl;
import { loadNavbar } from "../components/navbar.js";
loadNavbar();

//checks if env is dev or prod
if (import.meta.env.VITE_MODE === "dev") {
  apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
} else {
  apiBaseUrl = import.meta.env.VITE_API_BASE_URL_PROD;
}

// Example of loading jobs into the dropdown
const loadJobs = function () {
  fetch(`${apiBaseUrl}/api/jobs`)
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
document.getElementById("job-dropdown").addEventListener("change", displayJobDetails());

// Function to display job details
function displayJobDetails() {
  const selectedJobId = this.value;
  let startDate = new Date();
  let endDate = new Date();
  console.log(`Selected job ID: ${selectedJobId}`);
  fetch(`${apiBaseUrl}/api/jobs/${selectedJobId}`)
    .then((response) => response.json())
    .then((job) => {
      startDate = new Date(job.startDate);
      endDate = new Date(job.endDate);
      document.getElementById("job-name").textContent = job.jobName;
      document.getElementById("start-date").textContent = startDate.toISOString().split("T")[0];
      document.getElementById("end-date").textContent = endDate.toISOString().split("T")[0];
      document.getElementById("client").textContent = job.client;
      document.getElementById("rate").textContent = "$" + job.rate;
      document.getElementById("location").textContent = job.location;
      document.getElementById("job-code").textContent = job.showCode || "N/A";
      document.getElementById("hours-st").textContent = job.totalStraightTime || "N/A";
      document.getElementById("hours-ot").textContent = job.totalOverTime || "N/A";
      document.getElementById("hours-dt").textContent = job.totalDoubleTime || "N/A";
    })
    .then(displayInvoiceSummary(job))
    .catch((error) => console.error("Error loading job details:", error));
}

// Function to display job summary
function displayInvoiceSummary() {}

// TODO: Function to load job hours sumamry for invoice
// populates table body "timesheet-table-body"
function loadJobHoursSummary(selectedJobId) {
  // while loop for duration to add timecard rows based off of duration
  const job = selectedJobId;
  const duration = job.duration;

  // TODO: Add logic to populate table body
}

// TODO: Function to populate timesheet-table-body with job hours

//TODO: Look Into https://pdfkit.org/ to create PDFs for invoice
//TODO: Look into puppeteer to generate invoice pdf https://developer.chrome.com/docs/puppeteer/get-started/
//TODO: Add functionality to generate invoice
