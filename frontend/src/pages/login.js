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

// Event lister for login form submit
document.getElementById("login-form").addEventListener("submit", async function (event) {
  event.preventDefault();
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;
  try {
    const response = await fetch(`${url}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    const user = await response.json();
    localStorage.setItem("user", JSON.stringify(user));
    resetForm();
    window.location.href = "/user";
  } catch (error) {
    document.getElementById("error-message").textContent = error.message;
  } finally {
    resetForm();
  }
});

// Event lister for user signup form submit

// Event lister for user signup form submit
document.getElementById("signup-form").addEventListener("submit", async function (event) {
  event.preventDefault();
  const username = document.getElementById("signup-username").value;
  const password = document.getElementById("signup-password").value;
  try {
    const response = await fetch(`${url}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    const user = await response.json();
    localStorage.setItem("user", JSON.stringify(user));
    resetForm();
    window.location.href = "/user";
  } catch (error) {
    document.getElementById("error-message").textContent = error.message;
  } finally {
    resetForm();
  }
});

//event listenter for signup button >> show signup form / hide login form
document.getElementById("signup-btn").addEventListener("click", function () {
  document.getElementById("login").classList.add("hidden");
  document.getElementById("signup").classList.remove("hidden");
});

//TODO: add forgot password functionality
