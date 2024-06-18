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

  // Function to create a header or data cell
  function createCell(text, isHeader = false) {
    const cell = document.createElement("div");
    cell.textContent = text;
    cell.classList.add("flex-1", "p-2", isHeader ? "font-bold" : "text-gray-200");
    return cell;
  }

  // Create and append header row
  const headerTitles = ["Date", "Start Time", "End Time", "Hours Worked"];
  const header = document.createElement("div");
  header.classList.add("flex", "w-full", "justify-between", "bg-gray-100", "border-b", "border-gray-400", "text-gray-700");
  headerTitles.forEach((title) => header.appendChild(createCell(title, true)));
  container.appendChild(header);

  // Function to format date
  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return !isNaN(date.getTime()) ? date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }) : "Invalid date";
  }

  // Append each entry as a row
  job.showDayEntries.forEach((entry) => {
    const row = document.createElement("div");
    row.classList.add("flex", "flex-col", "md:flex-row", "md:items-center", "w-full", "bg-gray-700", "border-b", "border-gray-300");

    const dateDisplay = formatDate(entry.showDate);
    const dataValues = [dateDisplay, entry.clockIn, entry.clockOut, entry.dailyDuration];

    dataValues.forEach((value) => row.appendChild(createCell(value)));
    container.appendChild(row);
  });

  // Show Invoice Button Div
  const invoiceButtonDiv = document.createElement("div");
  invoiceButtonDiv.classList.add("flex", "w-full", "justify-center", "mt-4");
  invoiceButtonDiv.innerHTML = `<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" id="generate-invoice-button">Generate Invoice</button>`;
  container.appendChild(invoiceButtonDiv);
}

// Event listener for invoice button
document.getElementById("generate-invoice-button").addEventListener("click", generateInvoice);

// Function to generate invoice
function generateInvoice() {
  // TODO: Add logic to generate invoice
  console.log("Generating invoice...");

  // TODO: just xlsx.js to generate invoice

  // TODO: Then PATCH job with invoice url & marked isInvoiced true

  // TODO: add mail app to send invoice

  // TODO: then PATCH job with isSubmitted true

  console.log("Invoice generated.");
}

// TODO: Add logic to populate table body

// TODO: Function to populate timesheet-table-body with job hours

//TODO: Look Into https://pdfkit.org/ to create PDFs for invoice
//TODO: Look into puppeteer to generate invoice pdf https://developer.chrome.com/docs/puppeteer/get-started/
//TODO: Add functionality to generate invoice
