const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const url = apiBaseUrl + "/api/timecards";

//TODO: Find out why navbar is not working

//Global variables
let isEditing;
let editTargetTimecardID;
let globalHours = 0;
let globalMinutes = 0;

// Function to reset inputs
function resetForm() {
  document.getElementById("description").value = "";
  document.getElementById("clock-in-input").value = "";
  document.getElementById("clock-out-input").value = "";
  isEditing = false;
  editTargetTimecardID = "";
}

// Function to fetch and display unsubmitted timecards
async function fetchTimecards() {
  try {
    const response = await fetch(`${apiBaseUrl}/api/timecards?isSubmitted=false`);
    if (!response.ok) {
      throw new Error("Failed to fetch timecards");
    }
    const timecards = await response.json();
    displayTimecards(timecards);
  } catch (error) {
    console.error("Failed to fetch timecards:", error);
  }
}

//Display timecards
function displayTimecards(timecards) {
  const timecardContainer = document.querySelector("#time-entries-container");
  timecardContainer.innerHTML = "";

  timecards.forEach((timecard) => {
    if (!timecard.isSubmitted) {
      // Additional client-side safeguard
      let clockInTime = timecard.clockIn ? new Date(timecard.clockIn) : new Date();
      let clockOutTime = timecard.clockOut ? new Date(timecard.clockOut) : "Pending";
      let totalDuration = "Pending";

      if (timecard.clockOut) {
        const duration = clockOutTime - clockInTime;
        const hours = Math.floor(duration / (1000 * 60 * 60));
        const minutes = Math.floor((duration / (1000 * 60)) % 60);
        totalDuration = `${hours}:${minutes.toString().padStart(2, "0")}`;
        clockOutTime = formatTime(clockOutTime);

        // Calculates total hours and minutes
        globalHours += hours;
        globalMinutes += minutes;

        if (globalMinutes >= 60) {
          globalMinutes -= 60;
          globalHours += 1;
        }

        //Updates Front end total hours and minutes
        const totalHours = document.getElementById("total-hours");
        const totalMinutes = document.getElementById("total-minutes");
        const globalDuration = document.getElementById("total-duration");
        globalDuration.textContent = globalHours + ":" + globalMinutes.toString().padStart(2, "0");
        totalHours.textContent = globalHours;
        totalMinutes.textContent = globalMinutes;

        // Checks to see if duration is undefined and POSTs total duration, hours & minutes
        if (timecard.duration != undefined || "Pending") {
          let duration = totalDuration;

          const response = fetch(`${apiBaseUrl}/api/timecards/${timecard._id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ duration: duration, totalHours: hours, totalMinutes: minutes }),
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error("Failed to update timecard");
              }
            })
            .catch((error) => {
              console.error("Failed to update timecard:", error);
            });
        }
      }

      const row = document.createElement("tr");
      row.innerHTML = `
        <td><input type="checkbox" class="submit-checkbox" data-id="${timecard._id}"></td>
        <td class="border-b border-gray-200 p-2">${timecard.description}</td>
        <td class="border-b border-gray-200 p-2">${formatTime(clockInTime)}</td>
        <td class="border-b border-gray-200 p-2">${clockOutTime}</td>
        <td class="border-b border-gray-200 p-2">${totalDuration}</td>
        <td class="border-b border-gray-200 p-2"><button class="edit-btn bg-blue-400 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full" data-id="${
          timecard._id
        }">Edit</button></td>
        <td class="border-b border-gray-200 p-2"><button class="delete-btn bg-red-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full" data-id="${
          timecard._id
        }">Delete</button></td>
      `;
      timecardContainer.appendChild(row); // Add the row to the table
    }
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
  const task = {
    description: description,
    clockIn: new Date(),
  };

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

  console.log(`New Task Created: Description- ${task.description}, Clock In- ${task.clockIn}`);

  // Upon successful creation, enable clock controls
  document.getElementById("clock-controls").classList.remove("hidden");
  fetchTimecards();
}

// Fetch and display timecards when the page loads
window.onload = function () {
  fetchTimecards();
};

// Function to handle clock in
function clockIn(description) {
  // Retrieve the timecard ID of the edited timecard
  const timecardId = document.querySelector("#edited-timecard-id").textContent;
  // Retrieve the clock-in time from the input field
  const clockInTime = document.querySelector("#clock-in-input").value;
  console.log(`Clock In Time: ${clockInTime}`);

  // Get today's date
  const today = new Date();
  const dummyDate = today.toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

  // Combine today's date with the provided clock in time
  const clockInDateTimeString = `${dummyDate}T${clockInTime}:00`;

  // Parse the full date and time string into a Date object
  const clockInDate = new Date(clockInDateTimeString);
  console.log(`Clock In: ${clockInDate}`);

  // Send request to backend to clock In for the current task
  fetch(`${apiBaseUrl}/api/timecards/${timecardId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ clockIn: clockInDate }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to update clock-out time");
      }
      console.log(`Card edited successfully: ${timecardId}`);
      //Fetch and display updated timecards here
      fetchTimecards();
      resetForm();
    })
    .catch((error) => console.error(error));
}

// Function to handle clock out
function clockOut() {
  // Retrieve the timecard ID of the edited timecard
  const timecardId = document.querySelector("#edited-timecard-id").textContent;
  // Retrieve the clock-out time from the input field
  const clockOutTime = document.querySelector("#clock-out-input").value;
  console.log(`Clock Out Time: ${clockOutTime}`);

  // Get today's date
  const today = new Date();
  const dummyDate = today.toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

  // Combine today's date with the provided clock out time
  const clockOutDateTimeString = `${dummyDate}T${clockOutTime}:00`;

  // Parse the full date and time string into a Date object
  const clockOutDate = new Date(clockOutDateTimeString);
  console.log(`Clock Out: ${clockOutDate}`);

  // Send request to backend to clock out for the current task
  fetch(`${apiBaseUrl}/api/timecards/${timecardId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ clockOut: clockOutDate }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to update clock-out time");
      }
      console.log(`Card edited successfully: ${timecardId}`);
      //Fetch and display updated timecards here
      fetchTimecards();
      resetForm();
    })
    .catch((error) => console.error(error));
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

  console.log(`Timecard Deleted: ${timecardId}`);
  fetchTimecards();
}

// Function to handle batch timecard submission
function submitBatchTimecards() {
  const selectedCheckboxes = document.querySelectorAll(".submit-checkbox:checked");
  const idsToSubmit = Array.from(selectedCheckboxes).map((checkbox) => checkbox.getAttribute("data-id"));

  //console.log("Submitting IDs:", idsToSubmit); // Log the IDs to verify

  if (idsToSubmit.length === 0) {
    console.error("No timecards selected for submission.");
    return;
  }

  const requestUrl = `${apiBaseUrl}/api/timecards/submit-multiple`;

  //console.log("Making request to:", requestUrl);
  fetch(requestUrl, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ids: idsToSubmit }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to submit timecards");
      }
      return response.json();
    })
    .then((result) => {
      console.log(result.message);
      fetchTimecards(); // Refresh the list of timecards
    })
    .catch((error) => console.error("Error submitting timecards:", error));

  // reset page upon successful submission
  window.location.reload();
}

// Event listener for submit button
document.getElementById("submit-tasks").addEventListener("click", (event) => {
  event.preventDefault();
  submitBatchTimecards();
});

// Event listener for creating a task when the button is clicked
document.getElementById("create-task-button").addEventListener("click", function () {
  const description = document.querySelector("#description").value;
  createTask(description);
});

//Event listener for delete button
document.getElementById("time-entries-container").addEventListener("click", (event) => {
  if (event.target.classList.contains("delete-btn")) {
    const timecardId = event.target.getAttribute("data-id");
    deleteTimecard(timecardId);
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

// Event listener for edit button
document.getElementById("time-entries-container").addEventListener("click", (event) => {
  if (event.target.classList.contains("edit-btn")) {
    // Store the timecard ID of the edited timecard
    const editedTimecardId = event.target.getAttribute("data-id");

    //temporariliy set "data-id" to "edited-timecard-id"
    event.target.setAttribute("data-id", "edited-timecard-id");

    // Store the timecard ID in the hidden input field
    document.getElementById("edited-timecard-id").textContent = editedTimecardId;

    // Displays the clock controls
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

    console.log(`The edited timecard ID is: ${editedTimecardId}`);

    //Snap to top of window
    window.scrollTo(0, 0);
  }
});

// Event Listener for select all button and toggle check all checkboxes

document.getElementById("select-all-btn").addEventListener("click", (event) => {
  const checkboxes = document.querySelectorAll("input[type='checkbox']");
  checkboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      checkbox.checked = false;
    } else {
      checkbox.checked = true;
    }
  });
});
