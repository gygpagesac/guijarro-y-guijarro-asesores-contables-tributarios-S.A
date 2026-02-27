const toggle = document.getElementById("menu-toggle-new");
const menu = document.getElementById("menu-new");
toggle.addEventListener("click", () => {
  menu.classList.toggle("active");
});

