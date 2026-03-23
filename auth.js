import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://pcjqvqscarltpztdrrfp.supabase.co";
const SUPABASE_KEY = "sb_publishable_DYnjwiSWoiKabr-6WNlbFg_sncdthhO";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function mostrarPopup() {
  document.getElementById("popup-overlay").style.display = "flex";
  document.getElementById("fab").style.display = "none";                    // oculta bot
  document.querySelector(".whatsapp-float").style.display = "none";         // oculta whatsapp
}

window.cerrarPopup = function () {
  document.getElementById("popup-overlay").style.display = "none";
  document.getElementById("fab").style.display = "flex";                    // muestra bot
  document.querySelector(".whatsapp-float").style.display = "flex";         // muestra whatsapp
  setTimeout(mostrarPopup, 600000);
};

const { data: { session } } = await supabase.auth.getSession();

if (session) {
  // sesión manejada por header.js
} else {
  setTimeout(mostrarPopup, 600000)
}

document.getElementById("popup-btnLogin").addEventListener("click", async () => {
  const email = document.getElementById("popup-email").value;
  const password = document.getElementById("popup-password").value;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    document.getElementById("popup-mensaje").style.color = "red";
    document.getElementById("popup-mensaje").textContent = "Correo o contraseña incorrectos";
  } else {
    window.location.reload();
  }
});

document.getElementById("popup-btnRegister").addEventListener("click", async () => {
  const email = document.getElementById("popup-email").value;
  const password = document.getElementById("popup-password").value;
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) {
    document.getElementById("popup-mensaje").style.color = "red";
    document.getElementById("popup-mensaje").textContent = "Error: " + error.message;
  } else {
    await fetch("https://pcjqvqscarltpztdrrfp.supabase.co/functions/v1/agregar-contacto-brevo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_KEY}`
      },
      body: JSON.stringify({ email: email })
    });
    document.getElementById("popup-mensaje").style.color = "green";
    document.getElementById("popup-mensaje").textContent = "Cuenta creada! Ya puedes iniciar sesion.";
  }
});
