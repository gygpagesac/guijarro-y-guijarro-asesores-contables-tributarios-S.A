document.addEventListener("DOMContentLoaded", function () {

  // ===== MENÚ TOGGLE =====
  const toggle = document.getElementById("menu-toggle-new");
  const menu = document.getElementById("menu-new");

  if (toggle && menu) {
    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      menu.classList.toggle("active");
    });
  }

  // ===== DROPDOWNS EN MÓVIL =====
  document.querySelectorAll(".dropdown-new").forEach(function (dropdown) {
    const btn = dropdown.querySelector(".dropbtn-new");
    if (btn) {
      btn.addEventListener("click", function (e) {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          e.stopPropagation();
          const isActive = dropdown.classList.contains("active");
          document.querySelectorAll(".dropdown-new").forEach(function (d) {
            d.classList.remove("active");
          });
          if (!isActive) {
            dropdown.classList.add("active");
          }
        }
      });
    }
  });

  // ===== CERRAR MENÚ AL CLICK FUERA =====
  document.addEventListener("click", function () {
    if (window.innerWidth <= 768) {
      document.querySelectorAll(".dropdown-new").forEach(function (d) {
        d.classList.remove("active");
      });
      if (menu) menu.classList.remove("active");
    }
  });

  // ===== CARRUSEL =====
  const track = document.getElementById("carousel-track");
  if (track) {
    const images = track.innerHTML;
    track.innerHTML = images + images;
  }

});
