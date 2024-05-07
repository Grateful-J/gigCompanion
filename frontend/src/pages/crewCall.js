const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const url = apiBaseUrl + "/api/timecards";
import { loadNavbar } from "../components/navbar.js";
import { fetchAndPopulateJobs, populateJobsDropdown } from "../util/jobService.js";
loadNavbar();
fetchAndPopulateJobs();
