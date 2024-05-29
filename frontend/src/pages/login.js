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
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    const response = await fetch("/mongo/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      document.getElementById("login-message").innerText = `Login successful! User ID: ${data.userId}`;
      console.log(data);

      // Stores access token in session storage
      sessionStorage.setItem("authToken", data.accessToken);
      sessionStorage.setItem("gigUser", data);

      // stores access token in HTTP cookie
      //document.cookie = `accessToken=${data.accessToken};`;
      window.location.href = "/home";
    } else {
      const errorMessage = await response.text();
      document.getElementById("login-message").innerText = `Login failed: ${errorMessage}`;
    }
  } catch (error) {
    // Alerts user if login fails
    console.error("Error:", error);
    alert(`Error: ${error.message}`);
    document.getElementById("login-message").innerText = `Error: ${error.message}`;
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
