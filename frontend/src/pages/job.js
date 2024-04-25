import "/style.css";
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const gAPIKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

//Fetches and displays jobs to job table

let globalJobs;

//GET all jobs
async function fetchJobs() {
  try {
    const response = await fetch(`${apiBaseUrl}/api/jobs`);
    const jobs = await response.json();
    globalJobs = jobs; //update global variable
    console.log(`fetched jobs: ${globalJobs[0]}`);
    displayJobs(jobs);
  } catch (error) {
    console.error("Failed to fetch jobs", error);
  }
}

fetchJobs();

// Display Jobs
// Display Jobs
function displayJobs(jobs) {
  const container = document.querySelector("#jobs-container");
  container.innerHTML = ""; // Clear existing jobs

  jobs.forEach((job) => {
    const startDate = new Date(job.startDate);
    const endDate = new Date(job.endDate);
    const daysWorked = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    const row = document.createElement("tr");
    row.innerHTML = `
        <input type="hidden" class="job-id" value="${job._id}">
        <td class="border-b border-gray-200 p-2">${job.jobName}</td>
        <td class="border-b border-gray-200 p-2">${job.client}</td>
        <td class="border-b border-gray-200 p-2">${job.location}</td>
        <td class="border-b border-gray-200 p-2">${new Date(job.startDate).toLocaleDateString()}</td>
        <td class="border-b border-gray-200 p-2">${new Date(job.endDate).toLocaleDateString()}</td>
        <td class="border-b border-gray-200 p-2">${job.jobCode}</td>
        <td class="border-b border-gray-200 p-2">${daysWorked}</td>
        <td class="border-b border-gray-200 p-2">${job.rate}</td>
        <td class="border-b border-gray-200 p-2">${job.isFreelance ? "Yes" : "No"}</td>
        <td class="border-b border-gray-200 p-2">${job.isLocal ? "Yes" : "No"}</td>
        <td class="border-b border-gray-200 p-2"><button class="edit-btn" data-id="${job._id}">Edit</button></td>
        <td class="border-b border-gray-200 p-2"><button class="delete-btn bg-red-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full" data-id="${
          job._id
        }">Delete</button></td>
      `;
    container.appendChild(row);
  });
}

// Add event listener for edit buttons
document.addEventListener("click", async function (event) {
  if (event.target.classList.contains("edit-btn")) {
    const row = event.target.closest("tr");
    const jobId = row.querySelector(".job-id").value;
    const editBtn = row.querySelector(".edit-btn");

    //console.log(`row: ${row}`);
    //console.log(`jobID: ${jobId}`);
    //console.log(`editBtn: ${editBtn}`);

    //TODO: figure out way to edit jobCode, rate, isFreelance, isLocal

    //TODO: add edit button functionality
  }
});

//
