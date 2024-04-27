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

    let clockInTime;
    let clockOutTime;
    let totalDuration;

    // Set Clock In Time to current time
    if (!timecard.clockIn) {
      clockInTime = new Date(); // Set clockInTime to current time
    } else {
      clockInTime = new Date(timecard.clockIn); // Convert string representation to Date object
    }

    // Check if clockOutTime is defined & perform duration calculation
    if (timecard.clockOut !== undefined) {
      clockOutTime = new Date(timecard.clockOut);
      const duration = clockOutTime - clockInTime;
      const hours = Math.floor(duration / (1000 * 60 * 60));
      const minutes = Math.floor((duration / (1000 * 60)) % 60);
      totalDuration = `${hours}:${minutes.toString().padStart(2, "0")}`;
    } else {
      // Display "Pending" or a placeholder for clock out time
      clockOutTime = "Pending";
      totalDuration = "Pending";
    }

    const row = document.createElement("tr");
    row.innerHTML = `
    <td class="hidden" id="data-id">${timecardId}</td>
    <td class="border-b border-gray-200 p-2">${timecard.description}</td>
    <td class="border-b border-gray-200 p-2">${formatTime(clockInTime)}</td>
    <td class="border-b border-gray-200 p-2">${clockOutTime}</td>
    <td class="border-b border-gray-200 p-2">${totalDuration}</td>
    <td class="border-b border-gray-200 p-2"><button class="edit-btn bg-blue-400 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full" id="edit-btn" data-id="${timecardId}">Edit</button></td>
    <td class="border-b border-gray-200 p-2"><button class="delete-btn bg-red-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full" data-id="${timecardId}">Delete</button></td>
  `;

    timecardContainer.appendChild(row); // Add the row to the table
  });
}

// Helper function to format time as HH:mm
function formatTime(date) {
  const hours = date.getHours().toString().padStart(2, "0"); // Ensure two-digit format with leading zero
  const minutes = date.getMinutes().toString().padStart(2, "0"); // Ensure two-digit format with leading zero
  return `${hours}:${minutes}`;
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

  fetch(`${apiBaseUrl}/api/timecards/${timecardId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ clockOut: new Date() }),
  });
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

  // Get task description
  const description = document.getElementById("description").value;
  if (description.trim() !== "") {
    createTask(description);
    //then update the table
    fetchTimecards();
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

//Event listener for edit button
document.getElementById("time-entries-container").addEventListener("click", (event) => {
  if (event.target.classList.contains("edit-btn")) {
    //displays the clock controls
    document.getElementById("clock-controls").classList.remove("hidden");

    // Repopulate the form fields with data from the API
    const description = event.target.closest("tr").querySelector(".border-b:nth-child(2)").textContent;
    const clockInTime = event.target.closest("tr").querySelector(".border-b:nth-child(3)").textContent;
    const clockOutTime = event.target.closest("tr").querySelector(".border-b:nth-child(4)").textContent;

    document.getElementById("description").value = description;
    document.getElementById("clock-in-input").value = clockInTime;

    if (clockOutTime != "Pending") {
      document.getElementById("clock-out-input").value = clockOutTime;
    } else {
      // If clockOutTime is "Pending", set it to the current time
      const currentDate = new Date();
      const hours = currentDate.getHours().toString().padStart(2, "0"); // Ensure two-digit format with leading zero
      const minutes = currentDate.getMinutes().toString().padStart(2, "0"); // Ensure two-digit format with leading zero
      const formattedCurrentTime = `${hours}:${minutes.toString().padStart(2, "0")}`;
      document.getElementById("clock-out-input").value = formattedCurrentTime;
    }

    // Store the timecard ID for later use
    const timecardId = event.target.getAttribute("data-id");
    console.log(`The edited timecard ID is: ${timecardId}`);
  }
});
