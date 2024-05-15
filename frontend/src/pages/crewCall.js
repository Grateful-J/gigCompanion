let apiBaseUrl;
import { loadNavbar } from "../components/navbar.js";
import { fetchAndPopulateJobs, populateJobsDropdown, fetchNonSubmittedJobs, fetchJob } from "../util/jobService.js";
loadNavbar();
//fetchAndPopulateJobs(); // Fetch all jobs original **Working**
fetchNonSubmittedJobs();

// Global Variables
let duration = 0;
let travelDays = 0;
let isEditing = false;
let editingTimecardID = "";
let globalJob = {};
let globalTimecardId = "";

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
      globalTimecardId = job._id;

      // Add timecard rows based on selected job
      addTimecardFlex(job);

      // Add global timecard if one does not exist
      fetchJobAndDisplayTimecards(selectedJobId);

      // returns job
      globalJob = job;
      //console.log(`Global Job: ${globalJob}`);
    });
  }
});

function fetchJobAndDisplayTimecards(jobId) {
  //console.log(`Fetching Job: ${jobId}`);
  fetch(`${apiBaseUrl}/api/jobs/${jobId}`)
    .then((response) => response.json())
    .then((job) => {
      addTimecardFlex(job);
    })
    .catch((error) => console.error("Error fetching job:", error));
}

// Populate Job details with selected job
function populateJobDetails(job) {
  // Variables to Store Start & Stop Dates (formatted)
  const initStartDate = new Date(job.startDate);
  const initEndDate = new Date(job.endDate);
  const formattedISOStart = initStartDate.toISOString().slice(0, 10);
  const formattedISOStop = initEndDate.toISOString().slice(0, 10);

  // Convert formattedISO to readable dates (format: mm/dd/yyyy)
  const readableStartDate = formattedISOStart.slice(5, 7) + "/" + formattedISOStart.slice(8, 10) + "/" + formattedISOStart.slice(0, 4);
  const readableEndDate = formattedISOStop.slice(5, 7) + "/" + formattedISOStop.slice(8, 10) + "/" + formattedISOStop.slice(0, 4);

  // Populate job details
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
  startDate.textContent = readableStartDate;
  endDate.textContent = readableEndDate;
  client.textContent = job.client;
  rate.textContent = job.rate;
  location.textContent = job.location;
  jobCode.textContent = job.showCode;
  hoursSt.textContent = job.totalStraightTime;
  hoursOt.textContent = job.totalOverTime;
  hoursDt.textContent = job.totalDoubleTime;
}

// Function to addTimecard Flex container
// Dynamically add timecard rows based on the job's showDayEntries into a flexbox container
function addTimecardFlex(job) {
  // Create the container
  const container = document.getElementById("timesheet-flexbox");

  // Clear the container
  container.innerHTML = "";

  // Create the header row
  const header = document.createElement("div");
  header.classList.add("flex", "flex-row", "w-full", "justify-between", "text-gray-800", "border-b", "border-gray-400", "font-bold", "bg-gray-100");

  // Add headers for each column
  const headers = ["Day of Week", "Date", "Start Time", "End Time", "Hours Worked", "Confirm"];
  headers.forEach((headerText) => {
    const headerDiv = document.createElement("div");
    headerDiv.innerHTML = headerText;
    const formattedHeaderText = headerText.toLowerCase().replace(" ", "-") + "-header"; // Replaces spaces with hyphens and all to lower
    headerDiv.classList.add("flex-1", "text-center");
    headerDiv.setAttribute("id", formattedHeaderText);
    header.appendChild(headerDiv);
  });

  // Add the header row to the container
  container.appendChild(header);

  let travelDays = job.travelDays;
  console.log(`travelDays: ${travelDays}`);
  //travelDays = job.travelDays;
  //const durationIndex = job.duration - 1;

  // Generate rows based on the job's duration and start date
  const baseDate = new Date(job.startDate);
  for (let i = 0; i < job.duration; i++) {
    const currentDate = new Date(baseDate);
    currentDate.setDate(baseDate.getDate() + i);
    let formattedDate = currentDate.toISOString().split("T")[0]; // Format: yyyy-mm-dd

    // Format date to mm/dd/yyyy
    const formattedDateParts = formattedDate.split("-");
    formattedDate = formattedDateParts[1] + "/" + formattedDateParts[2] + "/" + formattedDateParts[0];

    const row = document.createElement("div");
    row.classList.add(
      "flex",
      "flex-row",
      "w-full",
      "items-baseline",
      "justify-between",
      "border",
      "border-gray-300",
      "self-center",
      "rouded",
      "space-x-2"
    );

    const dayOfWeek = document.createElement("div");
    dayOfWeek.innerHTML = `<p class="block p-2">${currentDate.toLocaleDateString("en-US", { weekday: "long" })}</p>`;
    dayOfWeek.classList.add("flex-1");

    const dateDiv = document.createElement("div");
    dateDiv.innerHTML = `<span class="block p-2">${formattedDate}</span>`;
    dateDiv.classList.add("flex-1");

    const startTimeInput = document.createElement("input");
    startTimeInput.type = "time";
    startTimeInput.name = "start-time";
    startTimeInput.step = "900"; // 15 minutes
    startTimeInput.classList.add(
      "border",
      "border-gray-300",
      "rounded",
      "px-1",
      "py-1",
      "text-gray-600",
      "flex-1",
      "max-w-36",
      "min-h-10",
      "text-balance"
    );

    const endTimeInput = document.createElement("input");
    endTimeInput.type = "time";
    endTimeInput.name = "end-time";
    endTimeInput.step = "900"; // 15 minutes
    endTimeInput.classList.add(
      "w-full",
      "border",
      "border-gray-300",
      "rounded",
      "px-1",
      "py-1",
      "text-gray-600",
      "flex-1",
      "max-w-36",
      "min-h-10",
      "text-balance"
    );

    const hoursWorkedInput = document.createElement("div");
    hoursWorkedInput.name = "hours-worked";
    hoursWorkedInput.classList.add(
      "w-full",
      "border",
      "border-gray-300",
      "rounded",
      "px-2",
      "py-1",
      "text-gray-600",
      "flex-1",
      "max-w-14",
      "block",
      "p-2",
      "bg-gray-100",
      "rounded",
      "text-center"
    );
    hoursWorkedInput.innerHTML = `<span class="">0</span>`;

    if ((job.travelDays > 0 && i === 0) || (job.travelDays > 0 && i === job.duration - 1)) {
      row.classList.add("bg-gray-600");
      startTimeInput.value = "06:00";
      endTimeInput.value = "16:00";
    }

    //TODO: figure out why .step isnt working with the seconds

    // TODO: if travelDays is not 0, show travel time and set hours worked to 10 for i[0] && length-1

    // Check if there is an entry for the current date and prefill inputs if data exists
    const rowId = `${job._id}-${formattedDate}-${i + 1}`;
    row.id = rowId;
    const entry = job.showDayEntries.find((entry) => entry.rowId === rowId);
    if (entry) {
      startTimeInput.value = entry.clockIn;
      endTimeInput.value = entry.clockOut;
      hoursWorkedInput.innerHTML = `<span>${entry.dailyDuration}</span>`; // Will eventually be calculated. current default is 0
    }

    const confirmButton = document.createElement("button");
    confirmButton.innerHTML = "Confirm";
    confirmButton.classList.add("bg-blue-500", "hover:bg-blue-700", "text-white", "font-bold", "py-2", "px-4", "rounded-md");
    confirmButton.setAttribute("type", "submit");
    confirmButton.setAttribute("id", "confirm-button");

    row.appendChild(dayOfWeek);
    row.appendChild(dateDiv);
    row.appendChild(startTimeInput);
    row.appendChild(endTimeInput);
    row.appendChild(hoursWorkedInput);
    row.appendChild(confirmButton);
    //console.log("Row Add with ID:", rowId);

    container.appendChild(row);
  }
}
// Function to PATCH showDayEntries based on row ID
function updateShowDayEntries(jobId, rowId, startTimeValue, endTimeValue) {
  console.log(`Updating showDayEntries for Job ID: ${jobId}, Row ID: ${rowId}`);

  fetch(`${apiBaseUrl}/api/jobs/daily/${jobId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      rowId: rowId,
      clockIn: startTimeValue,
      breakTime: 0, // Filler for now
      clockOut: endTimeValue,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("ShowDayEntries updated successfully:", data);
    })
    .catch((error) => console.error("Error updating showDayEntries:", error));
}

// Function to handle confirm button clicks and fetch times
function handleConfirmClick(row, jobId) {
  // Retrieve the start and end time inputs within the same row
  const startTimeInput = row.querySelector('input[name="start-time"]');
  const endTimeInput = row.querySelector('input[name="end-time"]');

  // Fetch the values from these inputs
  const startTimeValue = startTimeInput.value; //  startTimeInput.value : "No start time";
  const endTimeValue = endTimeInput.value; //  endTimeInput.value : "No end time";

  //console.log("Start Time:", startTimeValue);
  //console.log("End Time:", endTimeValue);

  // Find row id of parent div of the clicked button
  const rowId = row.id;
  //console.log(`Row ID: ${rowId}`);

  // PATCH showDayEntries
  updateShowDayEntries(jobId, rowId, startTimeValue, endTimeValue);
}

// Event delegation for confirm button
document.addEventListener("click", (event) => {
  // Check if the clicked element or its parent has the 'confirm-button' id
  if (event.target.id === "confirm-button" || event.target.closest("#confirm-button")) {
    event.preventDefault();
    // Find the row by navigating up from the confirm button
    const row = event.target.closest("div.flex-row");
    if (row) {
      const jobId = globalTimecardId;
      console.log(`now cicking Job ID: ${jobId}`);
      handleConfirmClick(row, jobId);

      // await and reload timecarentries
      fetchAndPopulateJobs(jobId);
    } else {
      console.log("Confirm button was clicked, but no row was found.");
    }
  }
});

// TODO: add expensse model to jobs

//Event listener for add expense button
document.getElementById("add-expense-btn").addEventListener("click", function () {
  console.log("Add expense button clicked");
  window.location.href = "addExpense.html";
});

//TODO: on Confirm /hide confirm button until edit

// TODO: Add notes

// TODO: NOTES API Routes

// Function to POST a new note to jobs
function createNote(id) {
  const noteDate = new Date();
  const noteDescription = document.querySelector("#note-description").value;
  const note = document.querySelector("#note-content").value;
  const photo = document.querySelector("#note-photo").value || "";

  const notes = {
    noteDate: noteDate,
    noteDescription: noteDescription,
    note: note,
    photo: photo,
  };

  fetch(`${apiBaseUrl}/api/jobs/notes/${id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(notes),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.error(error);
    });
}

// event listener for save note button
document.getElementById("save-note-btn").addEventListener("click", function () {
  const id = globalTimecardId;
  createNote(id);
});

// TODO: Add Expenses

// TODO: add DELETE to delete timecard entries

// TODO: add edit timecard entries

// TODO: optimize for mobile
// TODO: Mobile: Top view- just select job
// TODO: Mobile: below that- timecard flex
// TODO: Mobile: below that notes then expenses
// TODO:
