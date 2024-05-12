let apiBaseUrl;
import { loadNavbar } from "../components/navbar.js";
import { fetchAndPopulateJobs, populateJobsDropdown, fetchJob } from "../util/jobService.js";
loadNavbar();
fetchAndPopulateJobs();

// Global Variables
let duration = 0;
let travelDays = 0;

//checks if env is dev or prod
if (import.meta.env.VITE_MODE === "dev") {
  apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
} else {
  apiBaseUrl = import.meta.env.VITE_API_BASE_URL_PROD;
}

// Event listener for job dropdown
const jobDropdown = document.getElementById("job-dropdown");
jobDropdown.addEventListener("change", () => {
  const selectedJobId = jobDropdown.value;
  if (selectedJobId) {
    fetchJob(selectedJobId).then((job) => {
      populateJobDetails(job);
      duration = job.duration;
      travelDays = job.travelDays;
      addTimecardRows(job);
    });
  }
});

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
  startDate.textContent = job.startDate;
  endDate.textContent = job.endDate;
  client.textContent = job.client;
  rate.textContent = job.rate;
  location.textContent = job.location;
  jobCode.textContent = job.jobCode;
  hoursSt.textContent = job.hoursSt;
  hoursOt.textContent = job.hoursOt;
  hoursDt.textContent = job.hoursDt;
}

// TIME CARD
// DATE/ START TIME/ END TIME/ HOURS WORKED

// Dynamically add timecard rows based on duration value on table id="timesheet-table"

function addTimecardRows(job) {
  const table = document.getElementById("timesheet-table-body");
  const baseDate = new Date(job.startDate);
  for (let i = 0; i < duration; i++) {
    //dynamically add date based off of start date
    const rowDate = baseDate.setDate(baseDate.getDate() + 1);
    const date = document.createElement("td");
    const formattedDate = new Date(rowDate).toLocaleDateString();

    // TODO: set date to MM/DD/YYYY with no TIME
    date.innerHTML = formattedDate;

    const row = document.createElement("tr");
    const startTime = document.createElement("td");
    const endTime = document.createElement("td");
    const hoursWorked = document.createElement("td");
    const confirm = document.createElement("td");
    date.innerHTML = baseDate;

    // add field inputs for start and end time
    startTime.innerHTML = '<input type="time" class="w-full border border-gray-300 rounded px-2 py-1" name="start-time" id="start-time">';
    endTime.innerHTML = '<input type="time" class="w-full border border-gray-300 rounded px-2 py-1" name="end-time" id="end-time">';

    // calculate hours worked
    hoursWorked.innerHTML = '<input type="number" class="w-full border border-gray-300 rounded px-2 py-1" name="hours-worked" id="hours-worked">';

    // add a buttun labeled "Confirm"
    confirm.innerHTML = '<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" type="submit">Confirm</button>';

    row.appendChild(date);
    row.appendChild(startTime);
    row.appendChild(endTime);
    row.appendChild(hoursWorked);
    row.appendChild(confirm);
    table.appendChild(row);
  }
}

//TODO: on Confirm /hide confirm button until edit

// TODO: Add notes

// TODO: Add Expenses

// TODO: add calculate hours fuction (maybe in API instead)

// TODO: add PATCH to update timecard entries

// TODO: add POST to create timecard entries

// TODO: add DELETE to delete timecard entries

// TODO: add edit timecard entries
