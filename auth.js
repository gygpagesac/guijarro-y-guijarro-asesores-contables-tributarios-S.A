import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://pcjqvqscarltpztdrrfp.supabase.co";
const SUPABASE_KEY = "sb_publishable_DYnjwiSWoiKabr-6WNlbFg_sncdthhO";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- CONTROL DE UI (Mantenemos tus funciones originales) ---
let popupTimer;

function ocultarBotones() {
  const fab = document.getElementById("fab");
  const whatsapp = document.querySelector(".whatsapp-float");
  const btnSesion = document.getElementById("btnIniciarSesion");
  if (fab) fab.style.display = "none";
  if (whatsapp) whatsapp.style.display = "none";
  if (btnSesion) btnSesion.style.display = "none";
}

function mostrarPopup() {
  const popup = document.getElementById("popup-overlay");
  if (!popup || popup.style.display === "flex") return;
  popup.style.display = "flex";
  ocultarBotones();
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

function iniciarPopupAutomatico() {
  clearInterval(popupTimer);
  popupTimer = setInterval(() => { mostrarPopup(); }, 60000);
}

// --- VERIFICACIÓN DE SESIÓN ---
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  iniciarPopupAutomatico();
}

window.addEventListener("load", () => {
  if (sessionStorage.getItem("popupAbierto") === "true") {
    mostrarPopup();
  }
});

// --- 🔑 LOGIN ACTUALIZADO ---
document.getElementById("popup-btnLogin")?.addEventListener("click", async () => {
  const email = document.getElementById("popup-email").value;
  const password = document.getElementById("popup-password").value;
  const mensaje = document.getElementById("popup-mensaje");

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (mensaje) {
      mensaje.style.color = "red";
      mensaje.textContent = "Correo o contraseña incorrectos";
    }
  } else {
    sessionStorage.setItem("popupAbierto", "true");
    window.location.reload();
  }
});

// --- 📝 REGISTRO PASO 1 (Hacia Ventana de Datos) ---
document.getElementById("popup-btnRegister")?.addEventListener("click", async () => {
  const email = document.getElementById("popup-email").value;
  const password = document.getElementById("popup-password").value;
  const mensaje = document.getElementById("popup-mensaje");

  // 1. Registro inicial en Auth
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    if (mensaje) {
      mensaje.style.color = "red";
      mensaje.textContent = "Error: " + error.message;
    }
  } else {
    // 2. Guardamos el ID temporalmente para el siguiente paso
    localStorage.setItem('temp_user_id', data.user.id);
    localStorage.setItem('temp_user_email', email);

    // 3. Integración con Brevo (tu función original)
    await fetch(`${SUPABASE_URL}/functions/v1/agregar-contacto-brevo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_KEY}`
      },
      body: JSON.stringify({ email: email })
    });

    // 4. Redirección a la ventana de Datos Básicos de GYG ASESORES
    window.location.href = 'registro.html'; 
  }
});

// --- 📊 PASO FINAL: GUARDAR DATOS BÁSICOS EN TABLA PERFILES ---
// Este código se ejecuta cuando el usuario está en registro.html
document.getElementById("registro-completo-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const regMsg = document.getElementById('reg-message');
    const userId = localStorage.getItem('temp_user_id');

    const perfilData = {
        nombre_completo: document.getElementById('reg-nombre').value,
        identificacion: document.getElementById('reg-id').value,
        telefono: document.getElementById('reg-tel').value,
        direccion: document.getElementById('reg-dir').value
    };

    // Actualizamos la tabla 'perfiles' (la cual ya tiene una fila gracias al Trigger SQL)
    const { error } = await supabase
        .from('perfiles')
        .update(perfilData)
        .eq('id', userId);

    if (error) {
        if (error.code === '23505') {
            regMsg.style.display = 'block';
            regMsg.textContent = "El RUC/Cédula ya está registrado. Intente con otra información.";
        } else {
            regMsg.textContent = "Error: " + error.message;
        }
    } else {
        regMsg.style.color = "green";
        regMsg.innerHTML = "¡Datos validados! Revisa tu correo de <b>GYG ASESORES</b> para confirmar tu cuenta.";
        localStorage.removeItem('temp_user_id');
    }
});
