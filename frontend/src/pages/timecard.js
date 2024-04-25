const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

/* //Compute total hours
const computeTotalHours = (clockIn, clockOut) => {
  const clockInDate = new Date(clockIn);
  const clockOutDate = new Date(clockOut);
  const totalHours = (clockOutDate - clockInDate) / 1000 / 60 / 60;
  return totalHours;
};

//event listener on sumbit run computeTotalHours
document.querySelector("#timecard-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const clockIn = document.querySelector("#clock-in-time").value;
  const clockOut = document.querySelector("#clock-out-time").value;
  const totalHours = computeTotalHours(clockIn, clockOut);
  document.querySelector("#total-hours").value = totalHours;
  document.querySelector("#timecard-form").submit();
});
 */
// TODO: Handle timecard submissions in batches

//TODO: API calls to /timecard:
//clockIn: Date,
// clockOut: Date,
//description: String,
//duration: Number,
//isSubmited: { type: Boolean, default: false }

const url = apiBaseUrl + "/api/timecards";

// Function to reset form
function resetForm() {
  document.querySelector("#timecard-form").reset();
}

// TODO: Fetch timecards from API

// Fetch timecards from API
fetch(url)
  .then((response) => response.json())
  .then((data) => {
    const timecardsContainer = document.querySelector("#timecards-container");
    timecardsContainer.innerHTML = "";
    data.forEach((timecard) => {
      const timecardElement = document.createElement("div");
      timecardElement.classList.add("p-4", "border-b", "border-gray-300", "flex", "justify-between");
      timecardElement.innerHTML = `<p>${timecard.clockIn.toLocaleString()}</p><p>${timecard.clockOut.toLocaleString()}</p><p>${
        timecard.description
      }</p><p>${timecard.duration}</p>`;
      timecardsContainer.appendChild(timecardElement);
    });
  })
  .catch((error) => console.error(error));

// Function to handle task creation
function createTask(description) {
  // Send request to backend to create a new task with the provided description
  const task = {
    description: document.querySelector("#description").value,
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

// Function to handle clock in
function clockIn() {
  // Send request to backend to clock in for the current task
}

// Function to handle clock out
function clockOut() {
  // Send request to backend to clock out for the current task
}

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
