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

      // Clear existing <tr> elements
      const timecardTable = document.getElementById("timesheet-table-body");
      while (timecardTable.firstChild) {
        timecardTable.removeChild(timecardTable.firstChild);
      }

      // Add timecard rows based on selected job
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
    const initDate = new Date(rowDate);
    const formattedDate = initDate.toISOString().split("T")[0];
    console.log(formattedDate);

    // set class for each row to allow padding and empty space bewtween each row

    date.classList.add("p-8");

    // TODO: set date to MM/DD/YYYY with no TIME
    date.innerHTML = formattedDate;

    // TODO: find library to make proper HASH of rowID
    const jobId = job._id;
    const hashDate = formattedDate.replace(/\//g, "-");
    const rowNumber = i + 1;
    const rowId = `${jobId}-${hashDate}-${rowNumber}`;

    const row = document.createElement("tr");
    row.classList.add("border", "border-gray-300");
    row.setAttribute("id", rowId);
    const dayOfWeek = document.createElement("td");
    const startTime = document.createElement("td");
    const endTime = document.createElement("td");
    const hoursWorked = document.createElement("td");
    const confirm = document.createElement("td");

    // displays the day of week veritcally
    dayOfWeek.innerHTML = `<p class="flex flex-shrink -rotate-90 text-md -px-2">${initDate.toLocaleDateString("en-US", {
      weekday: "long",
    })}</p>`;

    // add field inputs for start and end time
    startTime.innerHTML = '<input type="time" class="w-full border border-gray-300 rounded px-2 py-1" name="start-time" id="start-time">';
    endTime.innerHTML = '<input type="time" class="w-full border border-gray-300 rounded px-2 py-1" name="end-time" id="end-time">';

    // calculate hours worked
    hoursWorked.innerHTML = '<input type="number" class="w-full border border-gray-300 rounded px-2 py-1" name="hours-worked" id="hours-worked">';

    // add a buttun labeled "Confirm"
    confirm.innerHTML = '<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" type="submit">Confirm</button>';

    row.appendChild(dayOfWeek);
    row.appendChild(date);
    row.appendChild(startTime);
    row.appendChild(endTime);
    row.appendChild(hoursWorked);
    row.appendChild(confirm);
    table.appendChild(row);
    console.log(`Row ${i + 1} added to table with ID: ${rowId}`);
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
