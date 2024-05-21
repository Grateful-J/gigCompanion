function loadNavbar() {
  fetch("navbar.html")
    .then((response) => response.text())
    .then((html) => {
      document.getElementById("navbar-placeholder").innerHTML = html;
      toggleNavbar();
      attachPushMeHandler();
    });
}

//function to chage navebar
function toggleNavbar() {
  document.getElementById("navbar-toggle").addEventListener("click", function () {
    const menu = document.getElementById("mobile-menu");
    menu.classList.toggle("hidden");
  });
}
// Define the pushMe function
function pushMe(event) {
  event.preventDefault();
  console.log("Button pushed!");

  let apiBaseUrl;

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

// Function to attach the pushMe handler
function attachPushMeHandler() {
  const pushMeButton = document.getElementById("pushMeButton");
  if (pushMeButton) {
    pushMeButton.addEventListener("click", pushMe);
  }
}

export { loadNavbar };
