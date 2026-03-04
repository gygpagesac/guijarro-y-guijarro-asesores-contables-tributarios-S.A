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
  // Obtener nombre del perfil si existe
  const { data: perfil } = await supabase
    .from("perfiles")
    .select("nombres")
    .eq("user_id", session.user.id)
    .single();

  const nombre = perfil?.nombres || session.user.email.split("@")[0];

  // Estilos del menú
  const estilos = document.createElement("style");
  estilos.textContent = `
    .user-menu-container { position: fixed; top: 12px; right: 15px; z-index: 9999; font-family: Montserrat, sans-serif; }
    .user-avatar-btn {
      background: #0e3d92;
      color: white;
      border: none;
      border-radius: 50px;
      padding: 8px 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
    .user-avatar-btn .avatar-circle {
      width: 28px;
      height: 28px;
      background: #f8b700;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
      color: #0e3d92;
    }
    .user-dropdown {
      display: none;
      position: absolute;
      top: 48px;
      right: 0;
      background: white;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      min-width: 200px;
      overflow: hidden;
    }
    .user-dropdown.active { display: block; }
    .user-dropdown-header {
      background: #0e3d92;
      color: white;
      padding: 12px 16px;
      font-size: 0.85rem;
    }
    .user-dropdown-header span {
      display: block;
      font-size: 0.75rem;
      color: #aac4ff;
      margin-top: 2px;
    }
    .user-dropdown a, .user-dropdown button {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 12px 16px;
      text-decoration: none;
      color: #1c1c1c;
      font-size: 0.88rem;
      background: none;
      border: none;
      cursor: pointer;
      font-family: Montserrat, sans-serif;
      font-weight: 500;
      text-align: left;
    }
    .user-dropdown a:hover, .user-dropdown button:hover { background: #f5f5f5; }
    .user-dropdown .btn-cerrar-sesion { color: #e53935; }
    .user-dropdown hr { border: none; border-top: 1px solid #eee; margin: 0; }
  `;
  document.head.appendChild(estilos);

  // Crear menú
  const container = document.createElement("div");
  container.className = "user-menu-container";
  container.innerHTML = `
    <button class="user-avatar-btn" id="avatarBtn">
      <div class="avatar-circle">${nombre.charAt(0).toUpperCase()}</div>
      ${nombre}
    </button>
    <div class="user-dropdown" id="userDropdown">
      <div class="user-dropdown-header">
        ${nombre}
        <span>${session.user.email}</span>
      </div>
      <a href="index.html">🏠 Página Principal</a>
      <a href="perfil.html">👤 Mi Perfil</a>
      <hr>
      <button class="btn-cerrar-sesion" id="btnCerrarSesion">🚪 Cerrar Sesión</button>
    </div>
  `;
  document.body.appendChild(container);

  // Toggle menú
  document.getElementById("avatarBtn").addEventListener("click", () => {
    document.getElementById("userDropdown").classList.toggle("active");
  });

  // Cerrar menú al hacer click fuera
  document.addEventListener("click", (e) => {
    if (!container.contains(e.target)) {
      document.getElementById("userDropdown").classList.remove("active");
    }
  });

  // Cerrar sesión
  document.getElementById("btnCerrarSesion").addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.reload();
  });

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
