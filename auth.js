import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://pcjqvqscarltpztdrrfp.supabase.co";
const SUPABASE_KEY = "sb_publishable_DYnjwiSWoiKabr-6WNlbFg_sncdthhO";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

//  Control del timer
let popupTimer;

//  Mostrar popup
function mostrarPopup() {
  //  Evita que se repita en la misma sesión
  if (sessionStorage.getItem("popupShown")) return;

  sessionStorage.setItem("popupShown", "true");

  const popup = document.getElementById("popup-overlay");
  const fab = document.getElementById("fab");
  const whatsapp = document.querySelector(".whatsapp-float");

  if (popup) popup.style.display = "flex";
  if (fab) fab.style.display = "none";
  if (whatsapp) whatsapp.style.display = "none";
}

// 🔹 Cerrar popup
window.cerrarPopup = function () {
  const popup = document.getElementById("popup-overlay");
  const fab = document.getElementById("fab");
  const whatsapp = document.querySelector(".whatsapp-float");

  if (popup) popup.style.display = "none";
  if (fab) fab.style.display = "flex";
  if (whatsapp) whatsapp.style.display = "flex";

  //  Limpia timer anterior
  clearTimeout(popupTimer);

  // Vuelve a programar popup (60s)
  popupTimer = setTimeout(mostrarPopup, 60000);
};

// 🔹 Verificar sesión
const { data: { session } } = await supabase.auth.getSession();

if (!session) {
  popupTimer = setTimeout(mostrarPopup, 60000);
}

//  LOGIN
document.getElementById("popup-btnLogin")?.addEventListener("click", async () => {
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
    window.location.reload();
  }
});

//  REGISTRO
document.getElementById("popup-btnRegister")?.addEventListener("click", async () => {
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
    //  Enviar a Brevo
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
