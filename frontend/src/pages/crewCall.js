let apiBaseUrl;
import { loadNavbar } from "../components/navbar.js";
import { fetchAndPopulateJobs, populateJobsDropdown, fetchJob } from "../util/jobService.js";
loadNavbar();
fetchAndPopulateJobs();

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

      // Clear existing <tr> elements
      const timecardTable = document.getElementById("timesheet-table-body");
      while (timecardTable.firstChild) {
        timecardTable.removeChild(timecardTable.firstChild);
      }

      // Add timecard rows based on selected job
      // addTimecardRows(job); legacy table code
      addTimecardFlex(job);

      // Add global timecard if one does not exist
      addGlobalTimecard(job);

      // returns job
      globalJob = job;
      console.log(`Global Job: ${globalJob}`);
    });
  }
});

function addGlobalTimecard(job) {
  // fetch all timecards
  fetch(`${apiBaseUrl}/api/timecards`)
    .then((response) => response.json())
    .then((timecards) => {
      const globalTimecard = timecards.filter((timecard) => timecard.jobID === job._id);
      console.log(`Timecard FOUND!: ${globalTimecard.length}`);

      // Check if there is at least one matching timecard
      if (globalTimecard.length > 0) {
        // Accessing the _id property of the first matching timecard
        globalTimecardId = globalTimecard[0]._id;
        console.log(`Global Timecard ID: ${globalTimecardId}`);
      } else {
        console.log("Timecard NOT FOUND! Creating new timecard.");
        // POST new global timecard
        fetch(`${apiBaseUrl}/api/timecards`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jobID: job._id,
            description: job.jobName,
            startDate: new Date(),
            endDate: new Date(),
            //duration: job.duration,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("Success:", data);
            globalTimecardId = data._id; // Ensures setting globalTimecardId to the correct property
            console.log(`New Global Timecard ID: ${globalTimecardId}`);
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Function to submit a row entry
function submitRowEntry(job) {
  // POST new day entry to global timecard
  const row = document.getElementById("timesheet-table-body");
}

// Populate Job details with selected job
function populateJobDetails(job) {
  // Variables to Store Start & Stop Dates (formatted)
  const initStartDate = new Date(job.startDate);
  const initEndDate = new Date(job.endDate);
  const formattedISOStart = initStartDate.toISOString().slice(0, 10);
  const formattedISOStop = initEndDate.toISOString().slice(0, 10);

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
  startDate.textContent = formattedISOStart;
  endDate.textContent = formattedISOStop;
  client.textContent = job.client;
  rate.textContent = job.rate;
  location.textContent = job.location;
  jobCode.textContent = job.jobCode;
  hoursSt.textContent = job.hoursSt;
  hoursOt.textContent = job.hoursOt;
  hoursDt.textContent = job.hoursDt;
}

// Function to addTimecard Flex container
// Dynamically add timecard rows based on the job duration into a flexbox container
function addTimecardFlex(job) {
  // Create the container
  const container = document.getElementById("timesheet-flexbox");

  // Clear the container
  container.innerHTML = "";

  // Create the header row
  const header = document.createElement("div");
  header.classList.add(
    "flex",
    "flex-row",
    "items-center",
    "justify-between",
    "text-gray-800",
    "px-4",
    "py-2",
    "border-b",
    "border-gray-400",
    "font-bold",
    "bg-gray-100"
  );

  // Add headers for each column
  const headerDayOfWeek = document.createElement("div");
  headerDayOfWeek.innerHTML = "Day of Week";
  headerDayOfWeek.classList.add("flex-1", "text-center");

  const headerDate = document.createElement("div");
  headerDate.innerHTML = "Date";
  headerDate.classList.add("flex-1", "text-center");

  const headerStartTime = document.createElement("div");
  headerStartTime.innerHTML = "Start Time";
  headerStartTime.classList.add("flex-1", "text-center");

  const headerEndTime = document.createElement("div");
  headerEndTime.innerHTML = "End Time";
  headerEndTime.classList.add("flex-1", "text-center");

  const headerHoursWorked = document.createElement("div");
  headerHoursWorked.innerHTML = "Hours Worked";
  headerHoursWorked.classList.add("flex-1", "text-center");

  const headerConfirm = document.createElement("div");
  headerConfirm.innerHTML = "Confirm";
  headerConfirm.classList.add("flex-1", "text-center");

  // Append headers to the header row
  header.appendChild(headerDayOfWeek);
  header.appendChild(headerDate);
  header.appendChild(headerStartTime);
  header.appendChild(headerEndTime);
  header.appendChild(headerHoursWorked);
  header.appendChild(headerConfirm);

  // Add the header row to the container
  container.appendChild(header);

  const baseDate = new Date(job.startDate);

  for (let i = 0; i < job.duration; i++) {
    const rowDate = baseDate.setDate(baseDate.getDate() + 1);
    const initDate = new Date(rowDate);
    const formattedDate = initDate.toISOString().split("T")[0];
    console.log(formattedDate);

    const row = document.createElement("div");
    row.classList.add("flex", "flex-row", "items-center", "justify-between", "p-4", "border", "border-gray-300", "mb-2");
    row.innerHTML = `<id="row-${i + 1}"></id>`;

    const dateDiv = document.createElement("div");
    dateDiv.innerHTML = `<span class="block p-2">${formattedDate}</span>`;
    dateDiv.classList.add("flex-1");

    const jobId = job._id;
    const hashDate = formattedDate.replace(/\//g, "-");
    const rowNumber = i + 1;
    const rowId = `${jobId}-${hashDate}-${rowNumber}`;
    row.setAttribute("id", rowId);

    const dayOfWeek = document.createElement("div");
    dayOfWeek.innerHTML = `<p class="block p-2">${initDate.toLocaleDateString("en-US", { weekday: "long" })}</p>`;
    dayOfWeek.classList.add("flex-1");

    const startTime = document.createElement("div");
    startTime.innerHTML = '<input type="time" class="w-full border border-gray-300 rounded px-2 py-1 text-gray-600" name="start-time">';
    startTime.classList.add("flex-1");
    startTime.setAttribute("id", `start-time-${rowId}`);

    const endTime = document.createElement("div");
    endTime.innerHTML = '<input type="time" class="w-full border border-gray-300 rounded px-2 py-1 text-gray-600" name="end-time">';
    endTime.classList.add("flex-1");

    const hoursWorked = document.createElement("div");
    hoursWorked.innerHTML = '<input type="number" class="w-full border border-gray-300 rounded px-2 py-1 text-gray-600" name="hours-worked">'; // Filler for now
    // TODO: hours worked = dynamically calculated
    hoursWorked.classList.add("flex-1");

    const confirm = document.createElement("div");
    confirm.innerHTML =
      '<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" id="confirm-button" type="submit">Confirm</button>';
    confirm.classList.add("flex-1");

    row.appendChild(dayOfWeek);
    row.appendChild(dateDiv);
    row.appendChild(startTime);
    row.appendChild(endTime);
    row.appendChild(hoursWorked);
    row.appendChild(confirm);

    container.appendChild(row);
    console.log(`Row ${i + 1} added to flexbox with ID: ${rowId}`);
  }
}

// Function to PATCH showDayEntries based off of row ID
function updateShowDayEntries(globalTimecardId, rowId, startTimeValue, endTimeValue) {
  const timecardId = globalTimecardId;
  console.log(`2nd Global debug: Timecard ID: ${timecardId}`);

  // PATCH showDayEntries
  fetch(`${apiBaseUrl}/api/timecards/daily/${timecardId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      showDayEntries: {
        rowId: rowId,
        //date: new Date(),
        clockIn: startTimeValue,
        breakTime: 0, // Filler for now
        clockOut: endTimeValue,
      },
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("ShowDayEntries updated successfully:", data);
    })
    .catch((error) => console.error("Error updating showDayEntries:", error));
}

// Function to handle confirm button clicks and fetch times
function handleConfirmClick(row) {
  // Retrieve the start and end time inputs within the same row
  const startTimeInput = row.querySelector('input[name="start-time"]');
  const endTimeInput = row.querySelector('input[name="end-time"]');

  // Fetch the values from these inputs
  const startTimeValue = startTimeInput ? startTimeInput.value : "No start time";
  const endTimeValue = endTimeInput ? endTimeInput.value : "No end time";

  console.log("Start Time:", startTimeValue);
  console.log("End Time:", endTimeValue);
}

// Event delegation for confirm button
document.addEventListener("click", (event) => {
  // Check if the clicked element or its parent has the 'confirm-button' id
  if (event.target.id === "confirm-button" || event.target.closest("#confirm-button")) {
    event.preventDefault();
    // Find row id of parent div of the clicked button
    const rowId = event.target.parentElement.parentElement.id;
    console.log(`Row ID: ${rowId}`);

    // Find the row by navigating up from the confirm button
    const row = event.target.closest("div.flex-row");
    if (row) {
      handleConfirmClick(row);

      // Find Values of start and end time and return as string
      const startTime = row.querySelector('input[name="start-time"]').value;
      const endTime = row.querySelector('input[name="end-time"]').value;
      console.log(`Start Time: ${startTime}`);
      console.log(`End Time: ${endTime}`);
      console.log(`--- ---- ---- ---- ---- ----`);
      // Convert start and end time from HH:mm to Date

      /*     // TODO: should these even be dates?
      function toDateWithOutTimeZone(date) {
        let tempTime = date.split(":");
        let dt = new Date();
        dt.setHours(tempTime[0]);
        dt.setMinutes(tempTime[1]);
        return dt;
      } */

      //const startTimeValue = toDateWithOutTimeZone(startTime); // TODO: should these even be dates?
      //const endTimeValue = toDateWithOutTimeZone(endTime); // TODO: should these even be dates?
      const startTimeValue = startTime;
      const endTimeValue = endTime;
      console.log(`Start Time: ${startTimeValue}`);
      console.log(`End Time: ${endTimeValue}`);

      // PATCH showDayEntries
      updateShowDayEntries(globalTimecardId, rowId, startTimeValue, endTimeValue);
    } else {
      console.log("Confirm button was clicked, but no row was found.");
    }
  }
});
//TODO: on Confirm /hide confirm button until edit

// TODO: Add notes

// TODO: Add Expenses

// TODO: add calculate hours fuction (maybe in API instead)

// TODO: add PATCH to update timecard entries

// TODO: add POST to create timecard entries

// TODO: add DELETE to delete timecard entries

// TODO: add edit timecard entries

// TODO: optimize for mobile
// TODO: Mobile: Top view- just select job
// TODO: Mobile: below that- timecard flex
// TODO: Mobile: below that notes then expenses
// TODO:

/// storing for later in case i decide to bail on flexbox
// TIME CARD
// DATE/ START TIME/ END TIME/ HOURS WORKED

/* // Dynamically add timecard rows based on duration value on table id="timesheet-table"
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
} */
