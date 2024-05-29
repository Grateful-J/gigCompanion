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
// Define the logOut function
function logOut() {
  fetch(`${apiBaseUrl}/logout`, {
    method: "GET",
    credentials: "include", // Include cookies in the request
  })
    .then((response) => {
      if (response.redirected) {
        sessionStorage.clear(); // Clear session storage on the client side
        window.location.href = response.url; // Redirect to the redirected URL
        console.log("Logout successful");
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
  const user = sessionStorage.getItem("username");
  const welcome = document.getElementById("navbar-welcome");
  welcome.textContent = `Welcome, ${user}`;
}

export { loadNavbar };
