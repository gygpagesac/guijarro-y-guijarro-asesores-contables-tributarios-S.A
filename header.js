import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://pcjqvqscarltpztdrrfp.supabase.co";
const SUPABASE_KEY = "sb_publishable_DYnjwiSWoiKabr-6WNlbFg_sncdthhO";
const ADMINS = ["guijarroyguijarrotk@gmail.com", "gygasesores1@gmail.com"];
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const { data: { session } } = await supabase.auth.getSession();

// Estilos
const estilos = document.createElement("style");
estilos.textContent = `
  .user-menu-container { position: relative; z-index: 9999; font-family: Montserrat, sans-serif; }
  .user-avatar-btn {
    background: #0e3d92;
    color: white;
    border: none;
    border-radius: 50px;
    padding: 7px 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.82rem;
    font-weight: 600;
  }
  .user-avatar-btn .avatar-circle {
    width: 26px;
    height: 26px;
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
    box-sizing: border-box;
  }
  .user-dropdown a:hover, .user-dropdown button:hover { background: #f5f5f5; }
  .user-dropdown .btn-cerrar-sesion { color: #e53935; }
  .user-dropdown hr { border: none; border-top: 1px solid #eee; margin: 0; }
  .btn-iniciar-sesion {
    background: #f8b700;
    color: #0e3d92;
    border: none;
    border-radius: 50px;
    padding: 7px 16px;
    cursor: pointer;
    font-size: 0.82rem;
    font-weight: 700;
    font-family: Montserrat, sans-serif;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .btn-iniciar-sesion:hover { background: #e0a500; }
`;
document.head.appendChild(estilos);

// Buscar el header
const headerContainer = document.querySelector(".header-new-container");
if (headerContainer) {
  const menuDiv = document.createElement("div");
  menuDiv.className = "user-menu-container";

  if (session) {
    const { data: perfil } = await supabase
      .from("perfiles")
      .select("nombres")
      .eq("user_id", session.user.id)
      .single();

    const nombre = perfil?.nombres || session.user.email.split("@")[0];

    menuDiv.innerHTML = `
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
        ${ADMINS.includes(session.user.email) ? '<a href="admin.html">🛡️ Panel Admin</a>' : ''}
        <hr>
        <button class="btn-cerrar-sesion" id="btnCerrarSesion">🚪 Cerrar Sesión</button>
      </div>
    `;

    headerContainer.appendChild(menuDiv);

    document.getElementById("avatarBtn").addEventListener("click", (e) => {
      e.stopPropagation();
      document.getElementById("userDropdown").classList.toggle("active");
    });

    document.addEventListener("click", () => {
      document.getElementById("userDropdown")?.classList.remove("active");
    });

    document.getElementById("btnCerrarSesion").addEventListener("click", async () => {
      await supabase.auth.signOut();
      window.location.reload();
    });

  } else {
    menuDiv.innerHTML = `
      <button class="btn-iniciar-sesion" id="btnIniciarSesion">
        👤 Iniciar Sesión
      </button>
    `;
    headerContainer.appendChild(menuDiv);  
    document.getElementById("btnIniciarSesion").addEventListener("click", () => {  
      const popup = document.getElementById("popup-overlay");  
      if (popup) {    
        popup.style.display = "flex";    
        // Ocultar botones flotantes y el propio botón    
        const fab = document.getElementById("fab");    
        const whatsapp = document.querySelector(".whatsapp-float");
        const btnSesion = document.getElementById("btnIniciarSesion"); 
        if (fab) fab.style.display = "none";
        if (whatsapp) whatsapp.style.display = "none";
        if (btnSesion) btnSesion.style.display = "none";
      } else {   
        window.location.href = "index.html"; 
      }
    });
  }
}
