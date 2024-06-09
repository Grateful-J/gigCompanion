function loadNavbar() {
  fetch("navbar.html")
    .then((response) => response.text())
    .then((html) => {
      document.getElementById("navbar-placeholder").innerHTML = html;
      toggleNavbar();
      attachlogOutHandler();
      loadWelcomeMessage();
    });
}
let apiBaseUrl;
//checks if env is dev or prod
if (import.meta.env.VITE_MODE === "dev") {
  apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
} else {
  apiBaseUrl = import.meta.env.VITE_API_BASE_URL_PROD;
}

//function to chage navebar
function toggleNavbar() {
  document.getElementById("navbar-toggle").addEventListener("click", function () {
    const menu = document.getElementById("mobile-menu");
    menu.classList.toggle("hidden");
  });
}
// Define the logOut function
function logOut() {
  fetch(`${apiBaseUrl}/logout`, {
    method: "GET",
    credentials: "include", // Include cookies in the request
  })
    .then((response) => {
      if (response.ok) {
        // Successful logout, clear the session storage
        sessionStorage.clear();
        // Successful logout, redirect to the login page
        window.location.href = "login.html";
      } else {
        throw new Error("Failed to log out");
      }
    })
    .catch((error) => {
      console.error("Error logging out:", error);
    });
}
// Function to attach the logOut handler
function attachlogOutHandler() {
  // Get the logout buttons if they exist
  const logOutButton = document.getElementById("logout-btn");
  const logOutButtonMobile = document.getElementById("logout-btn-mobile");

  if (logOutButton) {
    logOutButton.addEventListener("click", logOut);
  }
  if (logOutButtonMobile) {
    logOutButtonMobile.addEventListener("click", logOut);
  }
  if (!logOutButton && !logOutButtonMobile) {
    console.error("Logout buttons not found");
  }
}

// Pulls username from Session Storage
function loadWelcomeMessage() {
  const user = sessionStorage.getItem("gigUser");
  const firstName = user.firstName;
  const welcome = document.getElementById("navbar-welcome");
  console.log(`Hello user: ${firstName}`);

  if (!firstName) {
    welcome.textContent = `Hello!`;
  }
  welcome.textContent = `Welcome, ${firstName}`;
}

export { loadNavbar };
