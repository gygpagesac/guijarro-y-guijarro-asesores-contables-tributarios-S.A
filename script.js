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

