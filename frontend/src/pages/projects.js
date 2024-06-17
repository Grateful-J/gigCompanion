let apiBaseUrl;
const url = apiBaseUrl + "/api";
import { loadNavbar } from "../components/navbar.js";
loadNavbar();

// id = "add-project-btn";
// id = "previous-projects-btn";

// Function to display a form to add a new project
function displayProjectForm() {
  const projectFormContainer = document.querySelector("#project-form");
  projectFormContainer.classList.remove("hidden");
  window.scrollTo(0, 0);
}

// POST a new project

//Event listener for add project button
document.querySelector("#add-project-btn").addEventListener("click", displayProjectForm);

// Event listener for submit button
document.querySelector('button[type="submit"]').addEventListener("click", submitNewProject);
