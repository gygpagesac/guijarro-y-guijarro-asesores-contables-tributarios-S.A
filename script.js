document.addEventListener("DOMContentLoaded", () => {

  const menuToggle = document.getElementById("menu-toggle-new");
  const menu = document.getElementById("menu-new");

  const servicesToggle = document.getElementById("services-toggle");
  const dropdown = document.querySelector(".dropdown-content-new");

  // Menú principal móvil
  menuToggle.addEventListener("click", () => {
    menu.classList.toggle("active");
  });

  // Servicios: desplegar en móvil, redirigir en desktop
  servicesToggle.addEventListener("click", (e) => {

    // SOLO en móvil
    if (window.innerWidth <= 768) {

      // Si NO está abierto → abrir y NO redirigir
      if (!dropdown.classList.contains("active")) {
        e.preventDefault();
        dropdown.classList.add("active");
      }
      // Si YA está abierto → deja que redirija normal
    }

  });

});
