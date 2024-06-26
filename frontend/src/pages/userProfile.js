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

//check local storage for User
const user = sessionStorage.getItem("authToken");
if (user === null) {
  window.location.href = "/login";
} else {
  console.log("User verified: Profile Page");
}

// Function to clear form
function resetForm() {
  document.getElementById("profile-form").reset();
}

// Fetch user details
fetch(`${apiBaseUrl}/api/users/${user}`, {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include",
})
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
    document.getElementById("username").value = data.username;
    document.getElementById("firstName").value = data.firstName;
    document.getElementById("lastName").value = data.lastName;
    document.getElementById("email").value = data.email;
    document.getElementById("phoneNumber").value = data.phoneNumber;
    //document.getElementById("address").value = data.address === undefined ? "" : data.address;
  });

// Event lister for update user form
document.getElementById("profile-form").addEventListener("submit", async function (event) {
  event.preventDefault();
  const username = document.getElementById("username").value;
  const firstName = document.getElementById("firstName").value;
  const lastName = document.getElementById("lastName").value;
  const email = document.getElementById("email").value;
  const phoneNumber = document.getElementById("phoneNumber").value;
  //const address = document.getElementById("address").value;
  try {
    const response = await fetch(`${apiBaseUrl}/api/users/${user}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ username, firstName, lastName, email, phoneNumber }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
  } finally {
    resetForm();
    alert(`"User successfully updated : " ${username}, ${firstName}, ${lastName}, ${email}, ${phoneNumber}`);
    window.location.href = "/user";
  }
});
