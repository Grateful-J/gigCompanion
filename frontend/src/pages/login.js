import "/style.css";

// Function to Load navbar
function loadNavbar() {
  fetch("navbar.html")
    .then((response) => response.text())
    .then((html) => {
      document.getElementById("navbar-placeholder").innerHTML = html;
    });
}

loadNavbar();

//event listenter for signup button
document.getElementById("signup-btn").addEventListener("click", function () {
  document.getElementById("login").classList.add("hidden");
  document.getElementById("signup").classList.remove("hidden");
});
