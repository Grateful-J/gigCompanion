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
  // Add your custom functionality here
}

// Function to attach the pushMe handler
function attachPushMeHandler() {
  const pushMeButton = document.querySelector('button[onclick="pushMe(event)"]');
  if (pushMeButton) {
    pushMeButton.addEventListener("click", pushMe);
  }
}

export { loadNavbar };
