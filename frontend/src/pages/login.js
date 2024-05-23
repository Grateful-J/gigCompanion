let apiBaseUrl;
import { loadNavbar } from "../components/navbar.js";
loadNavbar();

//checks if env is dev or prod
if (import.meta.env.VITE_MODE === "dev") {
  apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
} else {
  apiBaseUrl = import.meta.env.VITE_API_BASE_URL_PROD;
}

document.getElementById("login-form").addEventListener("submit", async function (event) {
  event.preventDefault();

  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  try {
    const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    // After successfully logging in
    const { stashUser, stashRole, token } = await response.json();

    // Store user information and token in session storage
    //sessionStorage.setItem("token", token);
    sessionStorage.setItem("username", stashUser);
    sessionStorage.setItem("role", stashRole);

    //store token in cookie
    //document.cookie = `jwt=${token}; path=/; max-age=${60 * 60 * 24 * 30};`;

    // Redirect to appropriate page based on user role
    if (stashRole === "admin") {
      window.location.href = "/admin";
    } else {
      window.location.href = "/profile";
    }
  } catch (error) {
    alert(error.message);
  } finally {
    resetForm();
  }
});

function resetForm() {
  document.getElementById("login-form").reset();
}

/* // Event lister for user signup form submit
document.getElementById("signup-form").addEventListener("submit", async function (event) {
  event.preventDefault();
  const username = document.getElementById("signup-username").value;
  const password = document.getElementById("signup-password").value;
  try {
    const response = await fetch(`${apiBaseUrl}/api/auth/register`, {
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
  } finally {
    resetForm();
    alert("User successfully created");
    document.getElementById("signup").classList.add("hidden");
    document.getElementById("login").classList.remove("hidden");
  }
}); */

//event listenter for signup button >> show signup form / hide login form
document.getElementById("signup-btn").addEventListener("click", function () {
  document.getElementById("login").classList.add("hidden");
  document.getElementById("signup").classList.remove("hidden");
});

//TODO: add forgot password functionality
