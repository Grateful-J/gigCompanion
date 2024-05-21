function loadNavbar() {
  fetch("navbar.html")
    .then((response) => response.text())
    .then((html) => {
      document.getElementById("navbar-placeholder").innerHTML = html;
      toggleNavbar();
      attachlogOutHandler();
    });
}

//function to chage navebar
function toggleNavbar() {
  document.getElementById("navbar-toggle").addEventListener("click", function () {
    const menu = document.getElementById("mobile-menu");
    menu.classList.toggle("hidden");
  });
}
// Define the logOut function
function logOut(event) {
  event.preventDefault();
  console.log("Button pushed!");

  let apiBaseUrl;
  console.log(`API Base URL: ${apiBaseUrl}`);

  // For Dev purposes: check which environment is being used
  if (import.meta.env.VITE_MODE === "dev") {
    apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  } else {
    apiBaseUrl = import.meta.env.VITE_API_BASE_URL_PROD;
  }

  // GET /logout route
  fetch(`${apiBaseUrl}/logout`, {
    method: "GET",
    credentials: "include", // Include cookies in the request
  })
    .then((response) => {
      if (response.redirected) {
        window.location.href = "/login";
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
    console.log("Desktop logout button found and event listener attached.");
  }
  if (logOutButtonMobile) {
    logOutButtonMobile.addEventListener("click", logOut);
    console.log("Mobile logout button found and event listener attached.");
  }
  if (!logOutButton && !logOutButtonMobile) {
    console.error("Logout buttons not found");
  }
}

export { loadNavbar };
