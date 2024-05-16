let apiBaseUrl;
import { loadNavbar } from "../components/navbar.js";

loadNavbar();

// Event listener for navbar toggle if element exists
if (document.getElementById("navbar-toggle")) {
  document.getElementById("navbar-toggle").addEventListener("click", function () {
    let menu = document.getElementById("navbar-menu");
    menu.classList.toggle("hidden");
  });
}
