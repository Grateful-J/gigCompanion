import "/style.css";
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const url = apiBaseUrl + "/api";
import { loadNavbar } from "../components/navbar.js";
loadNavbar();

//check local storage for User
const user = JSON.parse(localStorage.getItem("user"));
if (user === null) {
  window.location.href = "/login";
} else {
  console.log("User: " + user);
}

// Function to reset inputs
function resetForm() {
  document.getElementById("signup-username").value = "";
  document.getElementById("signup-password").value = "";
}

// Fetch user details
fetch(`${url}/users/${user}`, {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include",
})
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
    document.getElementById("signup-username").value = data.username;
    document.getElementById("first-name").value = data.firstName;
    document.getElementById("last-name").value = data.lastName;
    document.getElementById("email").value = data.email;
    document.getElementById("phone-number").value = data.phoneNumber;
  });
