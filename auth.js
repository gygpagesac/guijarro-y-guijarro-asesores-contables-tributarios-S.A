import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const SUPABASE_URL = "https://pcjqvqscarltpztdrrfp.supabase.co";
const SUPABASE_KEY = "sb_publishable_DYnjwiSWoiKabr-6WNlbFg_sncdthhO";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let popupTimer;

function ocultarBotones() {
  const fab = document.getElementById("fab");
  const whatsapp = document.querySelector(".whatsapp-float");
  const btnSesion = document.getElementById("btnIniciarSesion");
  if (fab) fab.style.display = "none";
  if (whatsapp) whatsapp.style.display = "none";
  if (btnSesion) btnSesion.style.display = "none";
}

window.cerrarPopup = function () {
  const popup = document.getElementById("popup-overlay");
  const fab = document.getElementById("fab");
  const whatsapp = document.querySelector(".whatsapp-float");
  const btnSesion = document.getElementById("btnIniciarSesion");
  if (popup) popup.style.display = "none";
  if (fab) fab.style.display = "flex";
  if (whatsapp) whatsapp.style.display = "flex";
  if (btnSesion) btnSesion.style.display = "flex";
  sessionStorage.removeItem("popupAbierto");
};

window.mostrarRegistro = function () {
  document.getElementById("form-login").style.display = "none";
  document.getElementById("form-registro").style.display = "block";
  document.getElementById("popup-subtitulo").textContent = "Crea tu cuenta gratis";
};

window.mostrarLogin = function () {
  document.getElementById("form-registro").style.display = "none";
  document.getElementById("form-login").style.display = "block";
  document.getElementById("popup-subtitulo").textContent = "Inicia sesión para continuar";
};

function iniciarPopupAutomatico() {
  clearInterval(popupTimer);
  popupTimer = setInterval(() => {
    const popup = document.getElementById("popup-overlay");
    if (!popup) return;
    if (popup.style.display === "flex") return;
    popup.style.display = "flex";
    ocultarBotones();
  }, 60000);
}

// Verificar sesión
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  iniciarPopupAutomatico();
}

if (sessionStorage.getItem("popupAbierto") === "true") {
  const popup = document.getElementById("popup-overlay");
  if (popup) {
    popup.style.display = "flex";
    ocultarBotones();
  }
}

// LOGIN
document.getElementById("popup-btnLogin")?.addEventListener("click", async () => {
  const email = document.getElementById("popup-email").value.trim();
  const password = document.getElementById("popup-password").value;
  const mensaje = document.getElementById("popup-mensaje");

  if (!email || !password) {
    mensaje.style.color = "red";
    mensaje.textContent = "Por favor completa todos los campos.";
    return;
  }

  mensaje.style.color = "#0e3d92";
  mensaje.textContent = "Iniciando sesión...";

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    mensaje.style.color = "red";
    mensaje.textContent = "Correo o contraseña incorrectos.";
  } else {
    sessionStorage.setItem("popupAbierto", "true");
    window.location.reload();
  }
});

// REGISTRO
document.getElementById("popup-btnRegister")?.addEventListener("click", async () => {
  const nombres = document.getElementById("reg-nombres").value.trim();
  const apellidos = document.getElementById("reg-apellidos").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value;
  const ruc = document.getElementById("reg-ruc").value.trim();
  const telefono = document.getElementById("reg-telefono").value.trim();
  const ciudad = document.getElementById("reg-ciudad").value.trim();
  const mensaje = document.getElementById("popup-mensaje-reg");

  if (!nombres || !apellidos || !email || !password) {
    mensaje.style.color = "red";
    mensaje.textContent = "Nombres, apellidos, correo y contraseña son obligatorios.";
    return;
  }
  if (password.length < 6) {
    mensaje.style.color = "red";
    mensaje.textContent = "La contraseña debe tener al menos 6 caracteres.";
    return;
  }

  mensaje.style.color = "#0e3d92";
  mensaje.textContent = "Creando cuenta...";

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    mensaje.style.color = "red";
    if (error.message.includes("already registered") || error.message.includes("already exists")) {
      mensaje.textContent = "Este correo ya está registrado. Usa otro o inicia sesión.";
    } else {
      mensaje.textContent = "Error: " + error.message;
    }
    return;
  }

  if (data.user) {
    await supabase.from("perfiles").upsert({
      user_id: data.user.id,
      nombres: nombres,
      apellidos: apellidos,
      ruc: ruc,
      telefono: telefono,
      ciudad: ciudad
    });

    await fetch("https://pcjqvqscarltpztdrrfp.supabase.co/functions/v1/agregar-contacto-brevo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_KEY}`
      },
      body: JSON.stringify({ email, nombre: nombres })
    });
  }

  mensaje.style.color = "green";
  mensaje.textContent = "✅ ¡Cuenta creada! Ya puedes iniciar sesión.";
  ["reg-nombres","reg-apellidos","reg-email","reg-password","reg-ruc","reg-telefono","reg-ciudad"]
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ""; });

  setTimeout(() => {
    window.mostrarLogin();
    document.getElementById("popup-mensaje-reg").textContent = "";
  }, 2000);
});
  setTimeout(() => {
    window.mostrarLogin();
    document.getElementById("popup-mensaje-reg").textContent = "";
  }, 2000);
});
