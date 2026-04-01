import { supabase } from "./supabase-client.js";

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
  document.getElementById("popup-subtitulo").textContent = "Inicia sesion para continuar";
};

function iniciarPopupAutomatico() {
  clearInterval(popupTimer);
  popupTimer = setInterval(function() {
    const popup = document.getElementById("popup-overlay");
    if (!popup) return;
    if (popup.style.display === "flex") return;
    popup.style.display = "flex";
    ocultarBotones();
  }, 60000);
}

const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  iniciarPopupAutomatico();
  if (sessionStorage.getItem("popupAbierto") === "true") {
    const popup = document.getElementById("popup-overlay");
    if (popup) {
      popup.style.display = "flex";
      ocultarBotones();
    }
  }
} else {
  sessionStorage.removeItem("popupAbierto");
}

document.getElementById("popup-btnLogin").addEventListener("click", async function() {
  const email = document.getElementById("popup-email").value.trim();
  const password = document.getElementById("popup-password").value;
  const mensaje = document.getElementById("popup-mensaje");

  if (!email || !password) {
    mensaje.style.color = "red";
    mensaje.textContent = "Por favor completa todos los campos.";
    return;
  }

  mensaje.style.color = "#0e3d92";
  mensaje.textContent = "Iniciando sesion...";

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    mensaje.style.color = "red";
    mensaje.textContent = "Correo o contrasena incorrectos.";
  } else {
    sessionStorage.setItem("popupAbierto", "true");
    window.location.reload();
  }
});

document.getElementById("popup-btnRegister").addEventListener("click", async function() {
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
    mensaje.textContent = "Nombres, apellidos, correo y contrasena son obligatorios.";
    return;
  }
  if (password.length < 6) {
    mensaje.style.color = "red";
    mensaje.textContent = "La contrasena debe tener al menos 6 caracteres.";
    return;
  }

  mensaje.style.color = "#0e3d92";
  mensaje.textContent = "Creando cuenta...";

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    mensaje.style.color = "red";
    if (error.message.includes("already registered") || error.message.includes("already exists")) {
      mensaje.textContent = "Este correo ya esta registrado. Usa otro o inicia sesion.";
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
        "Authorization": "Bearer " + SUPABASE_KEY
      },
      body: JSON.stringify({ email: email, nombre: nombres })
    });
  }

  mensaje.style.color = "green";
  mensaje.textContent = "Cuenta creada! Ya puedes iniciar sesion.";

  var ids = ["reg-nombres","reg-apellidos","reg-email","reg-password","reg-ruc","reg-telefono","reg-ciudad"];
  ids.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.value = "";
  });

  setTimeout(function() {
    window.mostrarLogin();
    document.getElementById("popup-mensaje-reg").textContent = "";
  }, 2000);
});
