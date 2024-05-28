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
let globalExpenseId = "";
//TODO: No more global time card > stored in jobs
let globalTimecardId = ""; // Used to store selected jobId from dropdown

// For Dev purposes: check which environment is being used
if (import.meta.env.VITE_MODE === "dev") {
  apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
} else {
  apiBaseUrl = import.meta.env.VITE_API_BASE_URL_PROD;
}

// Helper Function for adding commas to numbers
function numberWithCommas(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// !Left Column: Job Dropdown //
// !--------------------------------------------------------- //
// Function: Fetch Job and Display Timecards
function fetchJobAndDisplayTimecards(jobId) {
  //console.log(`Fetching Job: ${jobId}`);
  fetch(`${apiBaseUrl}/api/jobs/${jobId}`)
    .then((response) => response.json())
    .then((job) => {
      addTimecardFlex(job);
      fetchExpenses(job);
    })
    .catch((error) => console.error("Error fetching job:", error));
}

// Function: Populate Job details with selected job
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
  rate.textContent = "$" + job.rate;
  location.textContent = job.location;
  jobCode.textContent = job.showCode;
  hoursSt.textContent = job.totalStraightTime;
  hoursOt.textContent = job.totalOverTime;
  hoursDt.textContent = job.totalDoubleTime;
}

// !Middle Column: Timecard
// !--------------------------------------------------------- //

// Function to Display the Timecard Flex container and populate it with timecard rows
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
  //console.log(`travelDays: ${travelDays}`);
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
      "flex-col",
      "flex-row",
      "sm:px-8",
      "w-full",
      "items-baseline",
      "justify-between",
      "border",
      "border-gray-300",
      "self-center",
      "rounded",
      "space-y-2",
      "lg:space-y-0",
      "lg:space-x-2",
      "p-2"
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
      "bg-gray-100",
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
    console.log("Row ID:", i, ":", rowId);
    const entry = job.showDayEntries.find((entry) => entry.rowId === rowId);
    if (entry) {
      startTimeInput.value = entry.clockIn;
      endTimeInput.value = entry.clockOut;
      hoursWorkedInput.innerHTML = `<span>${entry.dailyDuration}</span>`; // Will eventually be calculated. current default is 0
    }

    const confirmButton = document.createElement("button");
    confirmButton.innerHTML = "Confirm";
    confirmButton.classList.add(
      "bg-blue-500",
      "hover:bg-green-700",
      "text-white",
      "font-bold",
      "py-1",
      "px-2",
      "rounded",
      "w-full",
      "lg:w-auto",
      "flex-1"
    );
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
  //console.log(`Updating showDayEntries for Job ID: ${jobId}, Row ID: ${rowId}`);

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

// !Right Column: Notes //
// !--------------------------------------------------------- //

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
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      noteDate: noteDate,
      noteDescription: noteDescription,
      note: note,
      photo: photo,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      //console.log(data);
      fetchNotes(id);
    })
    .catch((error) => {
      console.error(error);
    });
}

// Function shows previous notes and lists each note as a li in a div
function showPreviousNotes(id) {
  //makes notes-list div visible
  const notesList = document.getElementById("notes-list");
  notesList.style.display = "block";

  // fetch previous notes
  fetch(`${apiBaseUrl}/api/jobs/notes/${id}`)
    .then((response) => response.json())
    .then((data) => {
      //console.log("Previous Notes:", data);
      const notes = data;
      const noteList = document.getElementById("submitted-notes-container");

      // Create a new div element with a li for each note
      notes.forEach((note) => {
        const noteDiv = document.createElement("div");
        const noteLi = document.createElement("li");
        const notePhotoSlug = note.photo ? ` - ${note.photo}` : ""; // Add the note description and photo to the li if there is any
        noteLi.textContent = note.noteDescription + " - " + note.note + notePhotoSlug;
        noteDiv.appendChild(noteLi);
        noteList.appendChild(noteDiv);
      });
    })
    .catch((error) => {
      console.error("Error fetching previous notes:", error);
    });
}

// !Bottom Div: Expenses //
// !----------------------------------------------------------- //

// Function to fetch & display expenses
function fetchExpenses(job) {
  fetch(`${apiBaseUrl}/api/jobs/expenses/${job._id}`)
    .then((response) => response.json())
    .then((data) => {
      //console.log("Expenses:", data);
      const expenses = data;
      populateExpensesList(expenses);

      // Make expenses list visible
      const expensesList = document.getElementById("expenses-container");
      expensesList.style.display = "block";
    })
    .catch((error) => {
      console.error("Error fetching expenses:", error);
    });
}

// Function to PATCH a new or existing expense by passing JobId and optionally ExpenseId

function createExpense(globalTimecardId) {
  const jobId = globalTimecardId;
  const expenseId = globalExpenseId;
  const expenseDate = document.querySelector("#expense-date").value;
  const description = document.querySelector("#expense-description").value;
  const amount = document.querySelector("#expense-amount").value;
  const category = document.querySelector("#expense-category").value || "";

  // If expenseId is not empty patch expense, else add expense

  const url = expenseId != "" ? `${apiBaseUrl}/api/jobs/expenses/${jobId}/${expenseId}` : `${apiBaseUrl}/api/jobs/expenses/${jobId}`;

  fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      expenseDate: expenseDate,
      expenseDescription: description,
      amount: amount,
      category: category,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      fetchExpenses(jobId);
      document.querySelector("#expense-form").reset();
      //document.querySelector("#expense-id").value = ""; // Clear the hidden input after submitting
    })
    .catch((error) => console.error("Error creating/updating expense:", error));
}

// Function to populate expenses list
function populateExpensesList(expenses) {
  const expensesList = document.getElementById("expenses-list");
  expensesList.innerHTML = "";
  expenses.forEach((expense) => {
    // Creates parent "row" div
    const expenseDivRow = document.createElement("div");
    expenseDivRow.classList.add(
      "flex",
      "flex-col",
      "lg:flex-row",
      "justify-between",
      "border-b",
      "border-gray-300",
      "py-2",
      "space-y-2",
      "lg:space-y-0",
      "lg:space-x-4"
    );
    expenseDivRow.setAttribute("data-expense-id", expense._id); // Setting the data-expense-id attribute
    expensesList.appendChild(expenseDivRow);

    // Hidden div for expense ID
    const expenseIdDiv = document.createElement("div");
    expenseIdDiv.textContent = expense._id;
    expenseIdDiv.classList.add("hidden");
    expenseIdDiv.setAttribute("id", `expense-id-${expense._id}`);
    expenseDivRow.appendChild(expenseIdDiv);

    // Expense date
    const expenseDateDiv = document.createElement("div");
    const expenseDate = new Date(expense.expenseDate).toLocaleDateString();
    expenseDateDiv.textContent = expenseDate;
    expenseDateDiv.classList.add("flex-1", "text-center", "lg:text-left", "px-2");
    expenseDivRow.appendChild(expenseDateDiv);

    // Expense amount
    const expenseAmountDiv = document.createElement("div");
    const exFloat = expense.amount.toFixed(2); // Round to 2 decimal places
    const exComma = numberWithCommas(exFloat); // Add commas to number
    expenseAmountDiv.textContent = `$${exComma}`;
    expenseAmountDiv.classList.add("flex-1", "text-center", "lg:text-left", "px-2");
    expenseDivRow.appendChild(expenseAmountDiv);

    // Expense description
    const expenseDescriptionDiv = document.createElement("div");
    expenseDescriptionDiv.textContent = expense.expenseDescription;
    expenseDescriptionDiv.classList.add("flex-1", "text-center", "lg:text-left", "px-2");
    expenseDivRow.appendChild(expenseDescriptionDiv);

    // Expense category
    const expenseCategoryDiv = document.createElement("div");
    expenseCategoryDiv.textContent = expense.category;
    expenseCategoryDiv.classList.add("flex-1", "text-center", "lg:text-left", "px-2");
    expenseDivRow.appendChild(expenseCategoryDiv);

    // Actions (e.g., edit and delete buttons)
    const actionsDiv = document.createElement("div");
    actionsDiv.classList.add("flex-1", "text-center", "lg:text-left", "px-2");
    actionsDiv.setAttribute("id", "actions-container");
    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.classList.add("bg-blue-500", "hover:bg-blue-700", "text-white", "font-bold", "py-1", "px-2", "rounded");
    editButton.setAttribute("id", "edit-expense-btn");
    actionsDiv.appendChild(editButton);
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.classList.add("bg-red-500", "hover:bg-red-700", "text-white", "font-bold", "py-1", "px-2", "rounded", "ml-2");
    deleteButton.setAttribute("id", "delete-expense-btn");
    actionsDiv.appendChild(deleteButton);
    expenseDivRow.appendChild(actionsDiv);
  });
}
// Helper function to Toggles Add button to Add or Update
function toggleAddButton() {
  const addExpenseBtn = document.getElementById("add-expense-btn");
  if (addExpenseBtn.textContent === "Add") {
    addExpenseBtn.textContent = "Update";
    addExpenseBtn.classList.remove("bg-green-500", "hover:bg-green-700");
    addExpenseBtn.classList.add("bg-blue-500", "hover:bg-blue-700");
  } else {
    addExpenseBtn.textContent = "Add";
    addExpenseBtn.classList.remove("bg-blue-500", "hover:bg-blue-700");
    addExpenseBtn.classList.add("bg-green-500", "hover:bg-green-700");
  }
}

// Function to edit an expense
function editExpense(expenseId) {
  // Fetch job and search for expense with matching ID
  fetch(`${apiBaseUrl}/api/jobs/${globalTimecardId}`)
    .then((response) => response.json())
    .then((data) => {
      const expense = data.expenses.find((expense) => expense._id === expenseId);
      if (expense) {
        populateForm(expense);
        toggleAddButton();

        // update Add button to Update
        const addExpenseBtn = document.getElementById("add-expense-btn");
        addExpenseBtn.textContent = "Update";
        addExpenseBtn.classList.remove("bg-green-500", "hover:bg-green-700");
        addExpenseBtn.classList.add("bg-blue-500", "hover:bg-blue-700");
      }
    })
    .catch((error) => console.error("Error fetching expenses:", error));

  // Populate form with expense data
  function populateForm({ _id, expenseDate, expenseDescription, amount, category }) {
    //document.querySelector("#expense-id").value = _id; // Set hidden input value to expenseId
    document.querySelector("#expense-date").value = new Date(expenseDate).toISOString().slice(0, 10); // Format date to YYYY-MM-DD
    document.querySelector("#expense-description").value = expenseDescription;
    document.querySelector("#expense-amount").value = amount;
    document.querySelector("#expense-category").value = category;
  }
}

// Function to delete an expense after alert confirmation
function deleteExpense(expenseId) {
  // Fetch job and search for expense with matching ID
  fetch(`${apiBaseUrl}/api/jobs/${globalTimecardId}`)
    .then((response) => response.json())
    .then((data) => {
      const expense = data.expenses.find((expense) => expense._id === expenseId);
      if (expense) {
        // Show alert confirmation
        if (confirm("Are you sure you want to delete this expense?")) {
          // Delete expense
          console.log("Expense deleted:", expense);
          const expenseId = expense._id;
          fetch(`${apiBaseUrl}/api/jobs/expenses/${globalTimecardId}/${expenseId}`, {
            method: "DELETE",
          })
            .then((response) => response.json())
            .then((data) => {
              console.log("Expense deleted:", data);
              fetchJobAndDisplayTimecards(globalTimecardId);
            })
            .catch((error) => console.error("Error deleting expense:", error));
        }
      }
    })
    .catch((error) => console.error("Error fetching expenses:", error));
}

// !Event Listeners //
// !----------------------------------------------------------- //

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

// Event delegation for "Confirm"  button for nested timecards
document.addEventListener("click", (event) => {
  // Check if the clicked element or its parent has the 'confirm-button' id
  if (event.target.id === "confirm-button" || event.target.closest("#confirm-button")) {
    event.preventDefault();
    //console.log(`confirm button clicked ${event.target.id}`);
    // Find the row by navigating up from the confirm button
    const row = event.target.closest("div.flex-col.lg || div:flex-row");
    if (row) {
      const jobId = globalTimecardId;
      //console.log(`now cicking Job ID: ${jobId}`);
      handleConfirmClick(row, jobId);

      // await and reload timecarentries
      fetchAndPopulateJobs(jobId);
    } else {
      console.log("Confirm button was clicked, but no row was found.");
    }
  }
});

// event listener for save note button
document.getElementById("save-note-btn").addEventListener("click", function () {
  const id = globalTimecardId;
  createNote(id);
});

// event listener for previous notes button
document.getElementById("previous-notes-btn").addEventListener("click", function () {
  const id = globalTimecardId;
  showPreviousNotes(id);
});

//Event listener for add expense button
document.getElementById("add-expense-btn").addEventListener("click", function () {
  //console.log("Add expense button clicked");
  //fetchExpenses(); // Temp test for functionality
  createExpense(globalTimecardId);
});

// Event delegation for edit button for nested expenses
document.addEventListener("click", (event) => {
  if (event.target.id === "edit-expense-btn" || event.target.closest("#edit-expense-btn")) {
    event.preventDefault();
    // Find the row by navigating up from the edit button
    const row = event.target.closest("div.flex-col.lg\\:flex-row"); // Ensure matching class
    if (row) {
      const expenseId = row.getAttribute("data-expense-id");
      console.log(`Editing expense ID: ${expenseId}`);
      globalExpenseId = expenseId;
      editExpense(expenseId);
    } else {
      console.log("Edit button was clicked, but no row was found.");
    }
  }
});

// Event delegation for delete button for nested expenses
document.addEventListener("click", (event) => {
  if (event.target.id === "delete-expense-btn" || event.target.closest("#delete-expense-btn")) {
    event.preventDefault();
    // Find the row by navigating up from the delete button
    const row = event.target.closest("div.flex-col.lg\\:flex-row"); // Ensure matching class
    if (row) {
      const expenseId = row.getAttribute("data-expense-id");
      console.log(`Deleting expense ID: ${expenseId}`);
      deleteExpense(expenseId);
    } else {
      console.log("Delete button was clicked, but no row was found.");
    }
  }
});

// TODO: add DELETE to delete timecard entries

// TODO: add edit timecard entries

//TODO: on Confirm /hide confirm button until edit
