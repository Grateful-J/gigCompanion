let apiBaseUrl;
import { loadNavbar } from "../components/navbar.js";
loadNavbar();

//checks if env is dev or prod
if (import.meta.env.VITE_MODE === "dev") {
  apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
} else {
  apiBaseUrl = import.meta.env.VITE_API_BASE_URL_PROD;
}

// Example of loading jobs into the dropdown
const loadJobs = function () {
  fetch(`${apiBaseUrl}/api/jobs`)
    .then((response) => response.json())
    .then((jobs) => {
      const select = document.getElementById("job-dropdown");
      jobs.forEach((job) => {
        const option = document.createElement("option");
        option.value = job._id;
        option.textContent = job.jobName;
        select.appendChild(option);
      });
    })
    .catch((error) => console.error("Error loading jobs:", error));
};

loadJobs();

// Event listener for job dropdown
document.getElementById("job-dropdown").addEventListener("change", displayJobDetails);

// Function to display job details
function displayJobDetails() {
  const selectedJobId = this.value;
  let startDate = new Date();
  let endDate = new Date();
  console.log(`Selected job ID: ${selectedJobId}`);
  fetch(`${apiBaseUrl}/api/jobs/${selectedJobId}`)
    .then((response) => response.json())
    .then((job) => {
      startDate = new Date(job.startDate);
      endDate = new Date(job.endDate);
      document.getElementById("job-name").textContent = job.jobName;
      document.getElementById("start-date").textContent = startDate.toISOString().split("T")[0];
      document.getElementById("end-date").textContent = endDate.toISOString().split("T")[0];
      document.getElementById("client").textContent = job.client;
      document.getElementById("rate").textContent = "$" + job.rate;
      document.getElementById("location").textContent = job.location;
      document.getElementById("job-code").textContent = job.showCode || "N/A";
      document.getElementById("hours-st").textContent = job.totalStraightTime || "N/A";
      document.getElementById("hours-ot").textContent = job.totalOverTime || "N/A";
      document.getElementById("hours-dt").textContent = job.totalDoubleTime || "N/A";
      displayInvoiceSummary(job);
    })

    .catch((error) => console.error("Error loading job details:", error));
}

// Function to display job summary
function displayInvoiceSummary(job) {
  const container = document.getElementById("timesheet-container");
  container.innerHTML = "";

  const header = document.createElement("div");
  header.classList.add(
    "hidden",
    "md:flex",
    "w-full",
    "justify-between",
    "text-gray-800",
    "border-b",
    "border-gray-400",
    "font-bold",
    "bg-gray-100",
    "p-2"
  );
  ["Date", "Start Time", "End Time", "Hours Worked"].forEach((text) => {
    const div = document.createElement("div");
    div.textContent = text;
    header.appendChild(div);
  });
  container.appendChild(header);

  job.showDayEntries.forEach((entry) => {
    const row = document.createElement("div");
    row.classList.add(
      "flex",
      "flex-col",
      "md:flex-row",
      "md:items-center",
      "w-full",
      "p-4",
      "border-b",
      "border-gray-300",
      "bg-gray-700",
      "text-gray-200",
      "md:space-x-2"
    );

    const dateFormatOptions = { month: "2-digit", day: "2-digit", year: "numeric" };
    const dateDisplay = new Date(entry.date).toLocaleDateString("en-US", dateFormatOptions);

    ["date", "clockIn", "clockOut", "dailyDuration"].forEach((key) => {
      const cell = document.createElement("div");
      cell.textContent = key === "date" ? dateDisplay : entry[key];
      row.appendChild(cell);
    });
    container.appendChild(row);
  });
}

// TODO: Add logic to populate table body

// TODO: Function to populate timesheet-table-body with job hours

//TODO: Look Into https://pdfkit.org/ to create PDFs for invoice
//TODO: Look into puppeteer to generate invoice pdf https://developer.chrome.com/docs/puppeteer/get-started/
//TODO: Add functionality to generate invoice
