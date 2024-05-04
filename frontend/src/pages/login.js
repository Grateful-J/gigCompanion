import "/style.css";
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const url = apiBaseUrl + "/api/users";

// Function to Load navbar
function loadNavbar() {
  fetch("navbar.html")
    .then((response) => response.text())
    .then((html) => {
      document.getElementById("navbar-placeholder").innerHTML = html;
    });
}

loadNavbar();

// Function to reset inputs
function resetForm() {
  document.getElementById("login-username").value = "";
  document.getElementById("login-password").value = "";
  document.getElementById("signup-username").value = "";
  document.getElementById("signup-password").value = "";
}

//event listenter for signup button >> show signup form / hide login form
document.getElementById("signup-btn").addEventListener("click", function () {
  document.getElementById("login").classList.add("hidden");
  document.getElementById("signup").classList.remove("hidden");
});

//TODO: add forgot password functionality
