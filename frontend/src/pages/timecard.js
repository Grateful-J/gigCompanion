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

// Assuming you already have the necessary setup for event listeners and fetching data

// Function to handle task creation
function createTask(description) {
  // Send request to backend to create a new task with the provided description
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
