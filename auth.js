import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://pcjqvqscarltpztdrrfp.supabase.co";
const SUPABASE_KEY = "sb_publishable_DYnjwiSWoiKabr-6WNlbFg_sncdthhO";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 🔴 control del timer
let popupTimer;

// 🔹 ocultar botones
function ocultarBotones() {
  const fab = document.getElementById("fab");
  const whatsapp = document.querySelector(".whatsapp-float");

  if (fab) fab.style.display = "none";
  if (whatsapp) whatsapp.style.display = "none";
}

// 🔹 mostrar popup
function mostrarPopup() {
  const popup = document.getElementById("popup-overlay");

  if (popup && popup.style.display === "flex") return;

  if (popup) popup.style.display = "flex";

  ocultarBotones();
}

// 🔹 cerrar popup
window.cerrarPopup = function () {
  const popup = document.getElementById("popup-overlay");
  const fab = document.getElementById("fab");
  const whatsapp = document.querySelector(".whatsapp-float");

  if (popup) popup.style.display = "none";
  if (fab) fab.style.display = "flex";
  if (whatsapp) whatsapp.style.display = "flex";
};

// 🔹 iniciar popup automático
function iniciarPopupAutomatico() {
  clearInterval(popupTimer);

  popupTimer = setInterval(() => {
    mostrarPopup();
  }, 60000);
}

// 🔹 verificar sesión
const { data: { session } } = await supabase.auth.getSession();

if (!session) {
  iniciarPopupAutomatico();
}

// 🔐 LOGIN
document.getElementById("popup-btnLogin")?.addEventListener("click", async () => {
  ocultarBotones(); // 👈 CLAVE

  const email = document.getElementById("popup-email").value;
  const password = document.getElementById("popup-password").value;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  const mensaje = document.getElementById("popup-mensaje");

  if (error) {
    if (mensaje) {
      mensaje.style.color = "red";
      mensaje.textContent = "Correo o contraseña incorrectos";
    }
  } else {
    sessionStorage.setItem("popupAbierto", "true");
    window.location.reload();
});

// 📝 REGISTRO
document.getElementById("popup-btnRegister")?.addEventListener("click", async () => {
  ocultarBotones(); // 👈 también aquí

  const email = document.getElementById("popup-email").value;
  const password = document.getElementById("popup-password").value;

  const { error } = await supabase.auth.signUp({ email, password });

  const mensaje = document.getElementById("popup-mensaje");

  if (error) {
    if (mensaje) {
      mensaje.style.color = "red";
      mensaje.textContent = "Error: " + error.message;
    }
  } else {
    await fetch("https://pcjqvqscarltpztdrrfp.supabase.co/functions/v1/agregar-contacto-brevo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_KEY}`
      },
      body: JSON.stringify({ email: email })
    });

    if (mensaje) {
      mensaje.style.color = "green";
      mensaje.textContent = "Cuenta creada! Ya puedes iniciar sesión.";
    }
  }
});
window.addEventListener("load", () => {
  if (sessionStorage.getItem("popupAbierto") === "true") {
    mostrarPopup();
  }
});
