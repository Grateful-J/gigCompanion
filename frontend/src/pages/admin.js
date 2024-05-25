let apiBaseUrl;
import { loadNavbar } from "../components/navbar.js";
loadNavbar();

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

function checkAuth() {
  const token = document.cookie.jwt;
  if (!token) {
    alert("You are not authenticated!");
    window.location.href = "/login.html";
  } else {
    fetch("/admin", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (response.status === 403 || response.status === 401) {
          document.getElementById("message").innerText = "Invalid or expired token!";
          // Optionally redirect to login page
          window.location.href = "/login.html";
        } else if (response.status === 200) {
          document.getElementById("message").innerText = "You are authenticated!";
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
}

//checkAuth();

//checks if env is dev or prod
if (import.meta.env.VITE_MODE === "dev") {
  apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
} else {
  apiBaseUrl = import.meta.env.VITE_API_BASE_URL_PROD;
}

// Function to Fetch Users and Dynamically fill table users-table
async function fetchUsers() {
  const response = await fetch(`${apiBaseUrl}/api/users`);
  const users = await response.json();
  displayUsers(users);
}

fetchUsers();

// Function to Dynamically fill table users-table
function displayUsers(users) {
  const usersContainer = document.getElementById("users-container");
  usersContainer.innerHTML = "";
  users.forEach((user) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="border-b border-gray-200 p-2">${user.firstName}</td>
      <td class="border-b border-gray-200 p-2">${user.lastName}</td>
      <td class="border-b border-gray-200 p-2">${user.email}</td>
      <td class="border-b border-gray-200 p-2">${user.phoneNumber}</td>
      <td>
        <button class="edit-btn border-b border-gray-200 p-2" data-user-id="${user._id}">Edit</button>
      </td>
      <td>
        <button class="delete-btn border-b border-gray-200 p-2" data-user-id="${user._id}">Delete</button>
      </td>
    `;
    usersContainer.appendChild(row);
  });
}

async function deleteUser(event) {
  const userId = event.target.getAttribute("data-user-id");

  const response = await fetch(`${apiBaseUrl}/api/auth/deleteUser`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: userId }),
  });

  const deleteData = await response.json();
  if (response.status === 401) {
    alert("User not deleted");
    return;
  }

  if (response.status === 200) {
    alert("User successfully deleted");
  } else {
    alert(`Failed to delete user: ${deleteData.message}`);
  }
}

// Event listener for delete user
document.addEventListener("click", async function (event) {
  if (event.target.classList.contains("delete-btn")) {
    const confirmDelete = confirm("Are you sure you want to delete this user?");
    if (confirmDelete) {
      await deleteUser(event);
    }
  }
});

// Sends POST request to add users
async function addUser() {
  //get cookie from HTTP only cookie
  const cookie = getCookie("bearer");
  console.log(`Cookie: ${cookie}`);
}

// Event listener for add user button
document.querySelector("#add-user-btn").addEventListener("click", addUser);
