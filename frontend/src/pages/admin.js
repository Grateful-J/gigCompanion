let apiBaseUrl;
import { loadNavbar } from "../components/navbar.js";
loadNavbar();

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
const cook = document.cookie;
console.log(`This is the cookie: ${cook}`);
// Function to get cookie by name
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  else return value;
}

// Function to Delete User with id in JSON body and role:admin
async function deleteUser(event) {
  const userId = event.target.getAttribute("data-user-id");

  console.log(`Deleting user with id: ${userId}`);
  const token = getCookie("jwt"); // Use getCookie function to get the jwt token
  console.log(`Token: ${token}`);

  const response = await fetch(`${apiBaseUrl}/api/auth/deleteUser`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Ensure the token is correctly set
    },
    body: JSON.stringify({ id: userId }), // Use 'id' key here
  });

  const deleteData = await response.json();
  if (response.status === 401) {
    alert("User not deleted");
    return; // Exit the function if unauthorized
  }

  if (response.status === 200) {
    alert("User successfully deleted");
  } else {
    alert(`Failed to delete user: ${deleteData.message}`);
  }

  location.assign("/admin");
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
