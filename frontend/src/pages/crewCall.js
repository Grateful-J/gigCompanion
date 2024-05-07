const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const url = apiBaseUrl + "/api/timecards";
import { loadNavbar } from "../components/navbar.js";
import { fetchAndPopulateJobs, populateJobsDropdown } from "../util/jobService.js";
loadNavbar();
fetchAndPopulateJobs();

// Populate Job details with selected job
function populateJobDetails(job) {
    const jobName = document.getElementById("job-name");
    const startDate = document.getElementById("start-date");
    const endDate = document.getElementById("end-date");
    const client = document.getElementById("client");
    const rate = document.getElementById("rate");
    const location = document.getElementById("location");
    const jobCode = document.getElementById("job-code");
    const hoursSt = document.getElementById("hours-st");
    const hoursOt = document.getElementById("hours-ot");
    const hoursDt = document.getElementById("hours-dt");
    jobName.textContent = job.jobName;
