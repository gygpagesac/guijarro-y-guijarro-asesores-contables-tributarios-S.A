import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://pcjqvqscarltpztdrrfp.supabase.co";
const SUPABASE_KEY = "sb_publishable_DYnjwiSWoiKabr-6WNlbFg_sncdthhO";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const { data: { session } } = await supabase.auth.getSession();
if (!session) window.location.href = "index.html";

const user = session.user;
document.getElementById("header-correo").textContent = user.email;

const { data: perfil } = await supabase
  .from("perfiles")
  .select("*")
  .eq("user_id", user.id)
  .single();

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
