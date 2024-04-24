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

//Display Jobs
function displayJobs(jobs) {
  const container = document.querySelector("#jobs-container");
  container.innerHTML = ""; // Clear existing jobs

  jobs.forEach((job) => {
    const startDate = new Date(job.startDate);
    const endDate = new Date(job.endDate);
    const daysWorked = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    const row = container.insertRow();
    row.innerHTML = `
    <td class="border-b border-gray-200 p-2">${job.jobName}</td>
    <td class="border-b border-gray-200 p-2">${job.client}</td>
    <td class="border-b border-gray-200 p-2">${job.location}</td>
    <td class="border-b border-gray-200 p-2">${new Date(job.startDate).toLocaleDateString()}</td>
    <td class="border-b border-gray-200 p-2">${new Date(job.endDate).toLocaleDateString()}</td>
    <td class="border-b border-gray-200 p-2">${job.jobCode}</td>
    <td class="border-b border-gray-200 p-2">${daysWorked}</td>
    <td class="border-b border-gray-200 p-2"><button class="edit-btn" data-id="${job._id}">Edit</button></td>
    <td class="border-b border-gray-200 p-2"><button class="delete-btn bg-red-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full" data-id="${
      job._id
    }">Delete</button></td>
  `;
  });
}
