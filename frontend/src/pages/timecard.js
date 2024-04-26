const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

//API calls to /timecard:
//clockIn: Date,
//clockOut: Date,
//description: String,
//duration: Number,
//isSubmited: { type: Boolean, default: false }

//Functions List:
//Get Timecards- fetchTimecards()
//Display timecards- displayTimecards()
//Create timecard- createTask()
//Edit timecard- editTimecard()
//Delete timecard- deleteTimecard()
//Reset form- resetForm()

const url = apiBaseUrl + "/api/timecards";

// Function to reset form
function resetForm() {
  document.querySelector("#timecard-form").reset();
}

//Get Timecards
async function fetchTimecards() {
  try {
    const response = await fetch(url);
    const timecards = await response.json();
    displayTimecards(timecards);
  } catch (error) {
    console.error("Failed to fetch timecards", error);
  }
}

//Display timecards
function displayTimecards(timecards) {
  const timecardContainer = document.querySelector("#time-entries-container");
  timecardContainer.innerHTML = "";
  timecards.forEach((timecard) => {
    // Timecard ID variable for event listeners
    const timecardId = timecard._id;

    // Convert string representations of dates to Date objects
    const clockInTime = new Date(timecard.clockIn);
    let clockOutTime;
    if (timecard.clockOut !== undefined) {
      clockOutTime = new Date(timecard.clockOut);
    } else {
      clockOutTime = new Date();
    }

    let ClockInTime = clockInTime.getTime();
    let ClockOutTime = clockOutTime.getTime();

    // Calculate duration in HH:MM format
    const duration = ClockOutTime - ClockInTime;
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration / (1000 * 60)) % 60);
    const totalDuration = `${hours}:${minutes.toString().padStart(2, "0")}`;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="hidden" id="data-id">${timecardId}</td>
      <td class="border-b border-gray-200 p-2">${timecard.description}</td>
      <td class="border-b border-gray-200 p-2">${clockInTime.getHours()}:${String(clockInTime.getMinutes()).padStart(2, "0")}</td>
      <td class="border-b border-gray-200 p-2">${clockOutTime.getHours()}:${String(clockOutTime.getMinutes()).padStart(2, "0")}</td>
      <td class="border-b border-gray-200 p-2">${totalDuration}</td>
      <td class="border-b border-gray-200 p-2"><button class="edit-btn" data-id="${timecardId}">Edit</button></td>
      <td class="border-b border-gray-200 p-2"><button class="delete-btn bg-red-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full" data-id="${timecardId}">Delete</button></td>
    `;

    timecardContainer.appendChild(row); // Add the row to the table
  });
}

// Function to handle task creation
function createTask(description) {
  // Send request to backend to create a new task with the provided description
  const task = {
    description: description,
    clockIn: new Date(),
  };
  console.log(`description: ${task}`);

  // Send request to backend to create a new task

  fetch(`${apiBaseUrl}/api/timecards`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(task),
  })
    .then((response) => response.json())
    .then((data) => console.log(data))
    .catch((error) => console.error(error));

  console.log(`New task updated: ${task}`);

  // Upon successful creation, enable clock controls
  document.getElementById("clock-controls").classList.remove("hidden");
}

// Event listener for creating a task when the button is clicked
document.getElementById("create-task-button").addEventListener("click", function () {
  const description = document.querySelector("#description").value;
  createTask(description);
});

// Fetch and display timecards when the page loads
window.onload = function () {
  fetchTimecards();
};

// Function to handle clock in
function clockIn(description) {
  // Update clock in time
  // Send request to backend to clock in for the current task
}

// Function to handle clock out
function clockOut() {
  // Send request to backend to clock out for the current task
}

// Function to handle task deletion
function deleteTimecard(timecardId) {
  // Send request to backend to delete the task with the provided ID
  fetch(`${apiBaseUrl}/api/timecards/${timecardId}`, {
    method: "DELETE",
  })
    .then((response) => response.json())
    .then((data) => console.log(data))
    .catch((error) => console.error(error));
}

//Event listener for delete button
document.getElementById("time-entries-container").addEventListener("click", (event) => {
  if (event.target.classList.contains("delete-btn")) {
    const timecardId = event.target.getAttribute("data-id");
    deleteTimecard(timecardId);
  }
});

// Event listener for create task button
document.getElementById("create-task-button").addEventListener("click", function (event) {
  event.preventDefault();
  const description = document.getElementById("description").value;
  if (description.trim() !== "") {
    createTask(description);
  } else {
    // Show error message or handle empty description
  }
});

// Event listener for clock in button
document.getElementById("clock-in-button").addEventListener("click", function (event) {
  event.preventDefault();
  clockIn();
});

// Event listener for clock out button
document.getElementById("clock-out-button").addEventListener("click", function (event) {
  event.preventDefault();
  clockOut();
});
