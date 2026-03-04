import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://pcjqvqscarltpztdrrfp.supabase.co";
const SUPABASE_KEY = "sb_publishable_DYnjwiSWoiKabr-6WNlbFg_sncdthhO";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Correos autorizados
const ADMINS = ["guijarroyguijarrotk@gmail.com", "gygasesores1@gmail.com"];

// Verificar sesión y permisos
const { data: { session } } = await supabase.auth.getSession();
if (!session || !ADMINS.includes(session.user.email)) {
  window.location.href = "index.html";
}

document.getElementById("admin-correo").textContent = session.user.email;

// Cerrar sesión
document.getElementById("btnLogout").addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.href = "index.html";
});

// Cargar solicitudes con datos del perfil
async function cargarSolicitudes() {
  const { data: solicitudes, error } = await supabase
    .from("solicitudes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !solicitudes) return;

  // Stats
  document.getElementById("total-solicitudes").textContent = solicitudes.length;
  document.getElementById("total-pendientes").textContent = solicitudes.filter(s => s.estado === "pendiente").length;
  document.getElementById("total-completadas").textContent = solicitudes.filter(s => s.estado === "completado").length;

  // Cargar perfiles
  const { data: perfiles } = await supabase.from("perfiles").select("*");
  const { data: correos } = await supabase.from("usuarios_correos").select("*");
  const { data: totalUsuarios } = await supabase.from("perfiles").select("id");
  document.getElementById("total-usuarios").textContent = totalUsuarios?.length || 0;

  const tbody = document.getElementById("tabla-solicitudes");
  tbody.innerHTML = "";

  if (solicitudes.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="sin-datos">No hay solicitudes aún</td></tr>`;
    return;
  }

  for (const s of solicitudes) {
    const perfil = perfiles?.find(p => p.user_id === s.user_id);
    const nombre = perfil ? `${perfil.nombres || ""} ${perfil.apellidos || ""}`.trim() : "Sin nombre";
    const correoUsuario = correos?.find(c => c.id === s.user_id)?.email || "-";
    const fecha = new Date(s.created_at).toLocaleDateString("es-EC");

    let badgeClass = "badge-pendiente";
    if (s.estado === "en proceso") badgeClass = "badge-proceso";
    if (s.estado === "completado") badgeClass = "badge-completado";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${fecha}</td>
      <td>${nombre}</td>
      <td>${correoUsuario}</td>
      <td>${s.tipo_declaracion || "-"}</td>
      <td>${s.periodo_fiscal || "-"}</td>
      <td>${s.num_personas || 1}</td>
      <td><span class="badge ${badgeClass}">${s.estado}</span></td>
      <td>
        <button class="btn-pdf" onclick="descargarPDF('${s.id}')">📄 PDF</button>
        <button class="btn-estado" onclick="cambiarEstado('${s.id}', '${s.estado}')">✏️ Estado</button>
      </td>
    `;
    tbody.appendChild(tr);
  }
}

// Cambiar estado de solicitud
window.cambiarEstado = async (id, estadoActual) => {
  const estados = ["pendiente", "en proceso", "completado"];
  const siguiente = estados[(estados.indexOf(estadoActual) + 1) % estados.length];
  await supabase.from("solicitudes").update({ estado: siguiente }).eq("id", id);
  cargarSolicitudes();
};

// Descargar PDF
window.descargarPDF = async (id) => {
  const { jsPDF } = window.jspdf;

  const { data: s } = await supabase.from("solicitudes").select("*").eq("id", id).single();
  const { data: perfil } = await supabase.from("perfiles").select("*").eq("user_id", s.user_id).single();

  const doc = new jsPDF();
  const margen = 20;
  let y = 20;

  // Encabezado
  doc.setFillColor(14, 61, 146);
  doc.rect(0, 0, 210, 35, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("G & G ASESORES TRIBUTARIOS", margen, 15);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Solicitud de Proceso", margen, 25);
  doc.text(`Fecha: ${new Date(s.created_at).toLocaleDateString("es-EC")}`, 140, 25);

  y = 50;
  doc.setTextColor(0, 0, 0);

  // Datos del cliente
  doc.setFillColor(248, 183, 0);
  doc.rect(margen, y - 5, 170, 8, "F");
  doc.setTextColor(14, 61, 146);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("DATOS DEL CLIENTE", margen + 2, y + 1);
  y += 12;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const datosPerfil = [
    ["Nombre:", `${perfil?.nombres || ""} ${perfil?.apellidos || ""}`.trim()],
    ["RUC / Cédula:", perfil?.ruc || "-"],
    ["Teléfono:", perfil?.telefono || "-"],
    ["Ciudad:", perfil?.ciudad || "-"],
    ["Tipo de Persona:", perfil?.tipo_persona || "-"],
    ["Régimen:", perfil?.regimen || "-"],
  ];

  for (const [label, valor] of datosPerfil) {
    doc.setFont("helvetica", "bold");
    doc.text(label, margen, y);
    doc.setFont("helvetica", "normal");
    doc.text(valor, margen + 50, y);
    y += 7;
  }

  y += 5;

  // Datos de la solicitud
  doc.setFillColor(248, 183, 0);
  doc.rect(margen, y - 5, 170, 8, "F");
  doc.setTextColor(14, 61, 146);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("DETALLES DEL PROCESO", margen + 2, y + 1);
  y += 12;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);

  const datosSolicitud = [
    ["Tipo de Declaración:", s.tipo_declaracion || "-"],
    ["Período Fiscal:", s.periodo_fiscal || "-"],
    ["Fecha Límite:", s.fecha_limite || "-"],
    ["Documentos:", s.documentos || "-"],
    ["Estado:", s.estado || "-"],
    ["N° de Personas:", String(s.num_personas || 1)],
  ];

  for (const [label, valor] of datosSolicitud) {
    doc.setFont("helvetica", "bold");
    doc.text(label, margen, y);
    doc.setFont("helvetica", "normal");
    doc.text(valor, margen + 50, y);
    y += 7;
  }

  // Observaciones
  if (s.observaciones) {
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.text("Observaciones:", margen, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    const lineas = doc.splitTextToSize(s.observaciones, 170);
    doc.text(lineas, margen, y);
    y += lineas.length * 7;
  }

  // Personas
  if (s.personas) {
    const personas = JSON.parse(s.personas);
    y += 5;
    doc.setFillColor(248, 183, 0);
    doc.rect(margen, y - 5, 170, 8, "F");
    doc.setTextColor(14, 61, 146);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("PERSONAS / TRÁMITES", margen + 2, y + 1);
    y += 12;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);

    for (let i = 0; i < personas.length; i++) {
      const p = personas[i];
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFont("helvetica", "bold");
      doc.text(`Persona ${i + 1}:`, margen, y);
      y += 7;
      doc.setFont("helvetica", "normal");
      doc.text(`Nombre: ${p.nombres || "-"}`, margen + 5, y); y += 6;
      doc.text(`RUC: ${p.ruc || "-"}`, margen + 5, y); y += 6;
      doc.text(`Tipo: ${p.tipo || "-"}`, margen + 5, y); y += 6;
      doc.text(`Servicio: ${p.servicio || "-"}`, margen + 5, y); y += 10;
    }
  }

  // Pie de página
  doc.setFillColor(14, 61, 146);
  doc.rect(0, 285, 210, 15, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text("G & G Asesores Tributarios | gygasesores1@gmail.com", margen, 293);

  doc.save(`solicitud_${s.id.substring(0, 8)}.pdf`);
};

cargarSolicitudes();
```

---

Sube los dos archivos a GitHub. Para acceder al panel ve a:
```
https://gygpagesac.github.io/guijarro-y-guijarro-asesores-contables-tributarios-S.A/admin.html
