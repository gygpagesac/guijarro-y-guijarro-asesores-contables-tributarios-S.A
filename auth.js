import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// 🔴 Reemplaza con tus datos de Supabase
const SUPABASE_URL = "https://pcjqvqscarltpztdrrfp.supabase.co";
const SUPABASE_KEY = "sb_publishable_DYnjwiSWoiKabr-6WNlbFg_sncdthhO";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const pagina = window.location.pathname;

// ── index.html ──
if (pagina.includes("index") || pagina === "/" || pagina.endsWith("/")) {

  // Si ya está logueado lo manda al dashboard
  const { data: { session } } = await supabase.auth.getSession();
  if (session) window.location.href = "dashboard.html";

  document.getElementById("btnLogin").addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      document.getElementById("mensaje").style.color = "red";
      document.getElementById("mensaje").textContent = "Correo o contraseña incorrectos";
    } else {
      window.location.href = "dashboard.html";
    }
  });

  document.getElementById("btnRegister").addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      document.getElementById("mensaje").style.color = "red";
      document.getElementById("mensaje").textContent = "Error: " + error.message;
    } else {
      document.getElementById("mensaje").style.color = "green";
      document.getElementById("mensaje").textContent = "¡Cuenta creada! Ahora inicia sesión.";
    }
  });
}

// ── dashboard.html ──
if (pagina.includes("dashboard")) {

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = "index.html"; // no está logueado
  } else {
    document.getElementById("correoUsuario").textContent = "Sesión: " + session.user.email;
  }

  document.getElementById("btnLogout").addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "index.html";
  });
}
