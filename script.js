const toggle = document.getElementById("menu-toggle-new");
const menu = document.getElementById("menu-new");
toggle.addEventListener("click", () => {
  menu.classList.toggle("active");
});
// Duplicar imágenes del carrusel automáticamente
const track = document.getElementById('carousel-track');
if (track) {
  const images = track.innerHTML;
  track.innerHTML = images + images; // duplica solo una vez
}
// Dropdowns en móvil — click para abrir/cerrar
document.querySelectorAll(".dropdown-new").forEach(dropdown => {
  dropdown.addEventListener("click", function(e) {
    if (window.innerWidth <= 768) {
      e.stopPropagation();
      const isActive = this.classList.contains("active");
      // Cerrar todos
      document.querySelectorAll(".dropdown-new").forEach(d => d.classList.remove("active"));
      // Abrir el clickeado si no estaba activo
      if (!isActive) this.classList.add("active");
    }
  });
});

// Cerrar menú al hacer click fuera
document.addEventListener("click", function() {
  if (window.innerWidth <= 768) {
    document.querySelectorAll(".dropdown-new").forEach(d => d.classList.remove("active"));
    menu.classList.remove("active");
  }
});
