import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://pcjqvqscarltpztdrrfp.supabase.co";
const SUPABASE_KEY = "sb_publishable_DYnjwiSWoiKabr-6WNlbFg_sncdthhO";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Verificar sesión
const { data: { session } } = await supabase.auth.getSession();
if (!session) window.location.href = "index.html";

// Generar campos por persona dinámicamente
const numPersonasInput = document.getElementById("num_personas");
const personasContainer = document.getElementById("personas-container");

function generarPersonas(n) {
  personasContainer.innerHTML = "";
  for (let i = 1; i <= n; i++) {
    const card = document.createElement("div");
    card.className = "persona-card";
    card.innerHTML = `
      <h4>Persona ${i}</h4>
      <div class="form-grid">
        <div class="form-group full">
          <label>Nombres Completos</label>
          <input type="text" id="p${i}_nombres" placeholder="Nombres completos" />
        </div>
        <div class="form-group">
          <label>RUC / Cédula</label>
          <input type="text" id="p${i}_ruc" placeholder="RUC o cédula" />
        </div>
        <div class="form-group">
          <label>Tipo de Persona</label>
          <select id="p${i}_tipo">
            <option value="">Selecciona...</option>
            <option value="natural">Persona Natural</option>
            <option value="juridica">Persona Jurídica</option>
          </select>
        </div>
        <div class="form-group full">
          <label>Servicio o Trámite que Necesita</label>
          <select id="p${i}_servicio">
            <option value="">Selecciona...</option>
            <option value="declaracion_iva">Declaración IVA</option>
            <option value="declaracion_renta">Declaración Renta</option>
            <option value="contabilidad">Contabilidad Mensual</option>
            <option value="nomina">Nómina y Roles de Pago</option>
            <option value="rimpe">RIMPE</option>
            <option value="anexos">Anexos Tributarios</option>
            <option value="firma_electronica">Firma Electrónica</option>
            <option value="constitucion">Constitución de Empresa</option>
            <option value="nafe">NAFE</option>
            <option value="sercop">SERCOP</option>
            <option value="otro">Otro</option>
          </select>
        </div>
      </div>
    `;
    personasContainer.appendChild(card);
  }
}

generarPersonas(1);

numPersonasInput.addEventListener("input", () => {
  const n = parseInt(numPersonasInput.value);
  if (n >= 1 && n <= 20) generarPersonas(n);
});

// Enviar solicitud
document.getElementById("btnEnviar").addEventListener("click", async () => {
  const n = parseInt(numPersonasInput.value);
  const personas = [];

  for (let i = 1; i <= n; i++) {
    personas.push({
      nombres: document.getElementById(`p${i}_nombres`)?.value || "",
      ruc: document.getElementById(`p${i}_ruc`)?.value || "",
      tipo: document.getElementById(`p${i}_tipo`)?.value || "",
      servicio: document.getElementById(`p${i}_servicio`)?.value || "",
    });
  }

  const solicitud = {
    user_id: session.user.id,
    tipo_declaracion: document.getElementById("tipo_declaracion").value,
    periodo_fiscal: document.getElementById("periodo_fiscal").value,
    fecha_limite: document.getElementById("fecha_limite").value,
    documentos: document.getElementById("documentos").value,
    observaciones: document.getElementById("observaciones").value,
    num_personas: n,
    personas: JSON.stringify(personas),
    estado: "pendiente",
    created_at: new Date().toISOString()
  };

  const { error } = await supabase.from("solicitudes").insert(solicitud);

  if (error) {
    document.getElementById("mensaje").style.color = "red";
    document.getElementById("mensaje").textContent = "Error al enviar: " + error.message;
  } else {
    document.getElementById("mensaje").style.color = "green";
    document.getElementById("mensaje").textContent = "✅ Solicitud enviada correctamente. Nos pondremos en contacto pronto.";
  }
});
