import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// 🔴 Reemplaza con tus datos
const SUPABASE_URL = "https://pcjqvqscarltpztdrrfp.supabase.co";
const SUPABASE_KEY = "sb_publishable_DYnjwiSWoiKabr-6WNlbFg_sncdthhO";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Mostrar / cerrar popup ──
function mostrarPopup() {
  document.getElementById("popup-overlay").style.display = "flex";
}

window.cerrarPopup = function () {
  document.getElementById("popup-overlay").style.display = "none";
  // Vuelve a aparecer en 15 minutos
  setTimeout(mostrarPopup, 5000);
};

// ── Verificar si ya está logueado ──
const { data: { session } } = await supabase.auth.getSession();

if (session) {
  // Ya está logueado, nunca mostrar popup
  console.log("Usuario logueado:", session.user.email);
} else {
  // No está logueado, mostrar popup después de 15 minutos
  setTimeout(mostrarPopup, 5000);
}

// ── Botón Login ──
document.getElementById("popup-btnLogin").addEventListener("click", async () => {
  const email = document.getElementById("popup-email").value;
  const password = document.getElementById("popup-password").value;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    document.getElementById("popup-mensaje").style.color = "red";
    document.getElementById("popup-mensaje").textContent = "Correo o contraseña incorrectos";
  } else {
    document.getElementById("popup-overlay").style.display = "none";
    document.getElementById("popup-mensaje").textContent = "";
  }
});

// ── Botón Registrarse ──
document.getElementById("popup-btnRegister").addEventListener("click", async () => {
  const email = document.getElementById("popup-email").value;
  const password = document.getElementById("popup-password").value;
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) {
    document.getElementById("popup-mensaje").style.color = "red";
    document.getElementById("popup-mensaje").textContent = "Error: " + error.message;
  } else {
    // Guardar correo en Brevo automáticamente
   await fetch("https://supabase.com/dashboard/project/pcjqvqscarltpztdrrfp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": "TU_API_KEY_DE_BREVO"
      },
      body: JSON.stringify({
        email: email,
        listIds: [2],
        updateEnabled: true
      })
    });

    document.getElementById("popup-mensaje").style.color = "green";
    document.getElementById("popup-mensaje").textContent = "¡Cuenta creada! Ya puedes iniciar sesión.";
  }
});
