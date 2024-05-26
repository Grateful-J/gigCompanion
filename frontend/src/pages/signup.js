let apiBaseUrl;
const url = apiBaseUrl + "/api";
import { loadNavbar } from "../components/navbar.js";
loadNavbar();

//checks if env is dev or prod
if (import.meta.env.VITE_MODE === "dev") {
  apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
} else {
  apiBaseUrl = import.meta.env.VITE_API_BASE_URL_PROD;
}

// Function to reset inputs
function resetForm() {
  document.getElementById("signup-username").value = "";
  document.getElementById("signup-password").value = "";
}
/* 
// Event lister for user signup form submit
document.getElementById("signup-form").addEventListener("submit", async function (event) {
  event.preventDefault();
  const username = document.getElementById("signup-username").value;
  const password = document.getElementById("signup-password").value;
  const firstName = document.getElementById("first-name").value;
  const lastName = document.getElementById("last-name").value;
  const email = document.getElementById("email").value;
  const phoneNumber = document.getElementById("phone-number").value;
  try {
    const response = await fetch(`${apiBaseUrl}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password, firstName, lastName, email, phoneNumber }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
  } finally {
    resetForm();
    alert(`"User successfully created : " ${username}, ${firstName}, ${lastName}, ${email}, ${phoneNumber}`);
    window.location.href = "/login";
  }
}); */

document.getElementById("signup-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("signup-password").value;

  try {
    const response = await fetch("/mongo/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      alert("Registration successful! Please check your email to confirm your account.");
    } else {
      const errorMessage = await response.text();
      alert(`Registration failed: ${errorMessage}`);
    }
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
});
