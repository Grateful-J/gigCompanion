import "/style.css";
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
import { loadNavbar } from "../components/navbar.js";
loadNavbar();

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

// Function to Delete User
async function deleteUser(event) {
  const userId = event.target.getAttribute("data-user-id");
  if (!userId) {
    alert("User ID not found");
    return;
  }
  const response = await fetch(`${apiBaseUrl}/api/users/${userId}`, {
    method: "DELETE",
  });
  if (response.ok) {
    alert("User deleted successfully");
    fetchUsers();
  } else {
    alert("Failed to delete user");
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
