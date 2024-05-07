const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const url = apiBaseUrl + "/api/timecards";
import { loadNavbar } from "../components/navbar.js";
import { fetchJobs, displayAndPopulateJobsDropdown } from "../util/jobService.js";
loadNavbar();

//Fetches and displays Jobs
let globalJobs;

//GET all jobs

fetchJobs();

// Populates Jobs dropdown
displayAndPopulateJobsDropdown(jobs);
