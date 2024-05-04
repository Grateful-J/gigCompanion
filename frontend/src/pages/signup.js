import "/style.css";
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const url = apiBaseUrl + "/api";
import { loadNavbar } from "../components/navbar.js";
loadNavbar();

// Function to reset inputs
function resetForm() {
  document.getElementById("signup-username").value = "";
  document.getElementById("signup-password").value = "";
}

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
    const response = await fetch(`${url}/auth/register`, {
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
});
