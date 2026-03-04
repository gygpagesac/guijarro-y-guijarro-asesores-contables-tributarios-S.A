import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://pcjqvqscarltpztdrrfp.supabase.co";
const SUPABASE_KEY = "sb_publishable_DYnjwiSWoiKabr-6WNlbFg_sncdthhO";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const { data: { session } } = await supabase.auth.getSession();
if (!session) window.location.href = "index.html";

const user = session.user;
document.getElementById("header-correo").textContent = user.email;

// Cargar perfil
const { data: perfilData } = await supabase
  .from("perfiles")
  .select("*")
  .eq("user_id", user.id);

const perfil = perfilData?.[0] || null;

if (perfil) {
  document.getElementById("nombres").value = perfil.nombres || "";
  document.getElementById("apellidos").value = perfil.apellidos || "";
  document.getElementById("ruc").value = perfil.ruc || "";
  document.getElementById("telefono").value = perfil.telefono || "";
  document.getElementById("ciudad").value = perfil.ciudad || "";
  document.getElementById("tipo_persona").value = perfil.tipo_persona || "";
  document.getElementById("regimen").value = perfil.regimen || "";
  document.getElementById("header-nombre").textContent = `${perfil.nombres || ""} ${perfil.apellidos || ""}`.trim() || "Mi Perfil";
}

// Guardar perfil
document.getElementById("btnGuardar").addEventListener("click", async () => {
  const datos = {
    user_id: user.id,
    nombres: document.getElementById("nombres").value,
    apellidos: document.getElementById("apellidos").value,
    ruc: document.getElementById("ruc").value,
    telefono: document.getElementById("telefono").value,
    ciudad: document.getElementById("ciudad").value,
    tipo_persona: document.getElementById("tipo_persona").value,
    regimen: document.getElementById("regimen").value,
  };

  const { error } = await supabase
    .from("perfiles")
    .upsert(datos, { onConflict: "user_id" });

  if (error) {
    document.getElementById("mensaje").style.color = "red";
    document.getElementById("mensaje").textContent = "Error al guardar: " + error.message;
  } else {
    document.getElementById("mensaje").style.color = "green";
    document.getElementById("mensaje").textContent = "¡Perfil guardado correctamente!";
    document.getElementById("header-nombre").textContent = `${datos.nombres} ${datos.apellidos}`.trim();
  }
});

// Cargar mensajes
async function cargarMensajes() {
  const { data: mensajes } = await supabase
    .from("mensajes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const container = document.getElementById("bandeja-container");

  if (!mensajes || mensajes.length === 0) {
    container.innerHTML = `<p style="color:#999; font-size:0.9rem;">No tienes mensajes aún.</p>`;
    return;
  }

  container.innerHTML = "";
  for (const m of mensajes) {
    const fecha = new Date(m.created_at).toLocaleDateString("es-EC");
    const div = document.createElement("div");
    div.className = `mensaje-card ${m.leido ? "" : "no-leido"}`;
    div.innerHTML = `
      <h4>${m.asunto || "Sin asunto"} ${!m.leido ? "🔔" : ""}</h4>
      <p>${m.mensaje}</p>
      <div class="mensaje-meta">
        <span>De: ${m.remitente}</span>
        <span>${fecha}</span>
      </div>
      <button class="btn-responder-msg" onclick="mostrarRespuesta('${m.id}', '${m.asunto}')">↩️ Responder</button>
    `;
    container.appendChild(div);

    if (!m.leido) {
      await supabase.from("mensajes").update({ leido: true }).eq("id", m.id);
    }
  }
}

// Mostrar formulario de respuesta
window.mostrarRespuesta = function(mensajeId, asunto) {
  document.getElementById("respuesta-container").style.display = "block";
  document.getElementById("respuesta-asunto").value = `RE: ${asunto}`;
  document.getElementById("respuesta-container").scrollIntoView({ behavior: "smooth" });

  document.getElementById("btnResponder").onclick = async () => {
    const asuntoResp = document.getElementById("respuesta-asunto").value;
    const mensajeResp = document.getElementById("respuesta-mensaje").value;

    if (!mensajeResp.trim()) return;

    const { error } = await supabase.from("mensajes").insert({
      user_id: "admin",
      remitente: user.email,
      asunto: asuntoResp,
      mensaje: mensajeResp,
    });

    if (!error) {
      document.getElementById("respuesta-mensaje").value = "";
      document.getElementById("respuesta-container").style.display = "none";
      alert("✅ Respuesta enviada correctamente.");
    }
  };
};

document.getElementById("btnCancelarRespuesta").addEventListener("click", () => {
  document.getElementById("respuesta-container").style.display = "none";
});

cargarMensajes();
