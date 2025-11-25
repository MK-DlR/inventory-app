// public/dropdown.js

document.addEventListener("DOMContentLoaded", function () {
  const dropdowns = document.querySelectorAll(".dropdown");

  dropdowns.forEach((dropdown) => {
    const button = dropdown.querySelector(".dropbtn");
    const content = dropdown.querySelector(".dropdown-content");

    // toggle dropdown on button click
    button.addEventListener("click", function (e) {
      e.stopPropagation();

      // close other dropdowns
      dropdowns.forEach((other) => {
        if (other !== dropdown) {
          other.classList.remove("open");
        }
      });

      // toggle current dropdown
      dropdown.classList.toggle("open");
    });

    // prevent dropdown from closing when clicking inside
    content.addEventListener("click", function (e) {
      e.stopPropagation();
    });
  });

  // close dropdowns when clicking outside
  document.addEventListener("click", function () {
    dropdowns.forEach((dropdown) => {
      dropdown.classList.remove("open");
    });
  });

  // close dropdowns when pressing esc
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      dropdowns.forEach((dropdown) => {
        dropdown.classList.remove("open");
      });
    }
  });
});
