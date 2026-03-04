import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://pcjqvqscarltpztdrrfp.supabase.co";
const SUPABASE_KEY = "sb_publishable_DYnjwiSWoiKabr-6WNlbFg_sncdthhO";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function mostrarPopup() {
  document.getElementById("popup-overlay").style.display = "flex";
}

window.cerrarPopup = function () {
  document.getElementById("popup-overlay").style.display = "none";
  setTimeout(mostrarPopup, 5000);
};

const { data: { session } } = await supabase.auth.getSession();

if (session) {
  const btnPerfil = document.createElement("a");
  btnPerfil.href = "perfil.html";
  btnPerfil.textContent = "👤 Mi Perfil";
  btnPerfil.style.cssText = "position:fixed; top:15px; right:160px; background:#3ecf8e; color:white; padding:8px 16px; border-radius:20px; text-decoration:none; font-family:Montserrat,sans-serif; font-size:0.85rem; font-weight:600; z-index:9999; box-shadow:0 2px 8px rgba(0,0,0,0.2);";
  document.body.appendChild(btnPerfil);

  const btnCerrar = document.createElement("button");
  btnCerrar.textContent = "Cerrar Sesion";
  btnCerrar.style.cssText = "position:fixed; top:15px; right:15px; background:#1c1c1c; color:white; padding:8px 16px; border-radius:20px; border:none; font-family:Montserrat,sans-serif; font-size:0.85rem; font-weight:600; z-index:9999; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.2);";
  btnCerrar.addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.reload();
  });
  document.body.appendChild(btnCerrar);
} else {
  setTimeout(mostrarPopup, 5000);
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
