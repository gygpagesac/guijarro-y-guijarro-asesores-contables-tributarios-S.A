const WHATSAPP_NUMBER = '593991361449'; // ← Cambia este número

let chatOpen = false;
let userName = '';
let answers = {};
let currentFlow = null;
let started = false;

// ─── UTILIDADES UI ────────────────────────────────────────────────────────────

function toggleChat() {
  chatOpen = !chatOpen;
  document.getElementById('chat-window').classList.toggle('open', chatOpen);
  const badge = document.querySelector('#fab .badge');
  if (badge) badge.style.display = 'none';
  if (chatOpen && !started) {
    started = true;
    setTimeout(() => startConversation(), 300);
  }
}

function getTime() {
  return new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
}

function scrollBottom() {
  const body = document.getElementById('chat-body');
  setTimeout(() => body.scrollTop = body.scrollHeight, 50);
}

function addBotMsg(text) {
  return new Promise(resolve => {
    const typing = document.createElement('div');
    typing.className = 'typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    const body = document.getElementById('chat-body');
    body.appendChild(typing);
    scrollBottom();
    setTimeout(() => {
      typing.remove();
      const msg = document.createElement('div');
      msg.className = 'msg bot';
      msg.innerHTML = `${text}<div class="time">${getTime()}</div>`;
      body.appendChild(msg);
      scrollBottom();
      resolve();
    }, 700);
  });
}

function addUserMsg(text) {
  const body = document.getElementById('chat-body');
  const msg = document.createElement('div');
  msg.className = 'msg user';
  msg.innerHTML = `${text}<div class="time">${getTime()} ✓✓</div>`;
  body.appendChild(msg);
  scrollBottom();
}

function showOptions(opts, onSelect) {
  const body = document.getElementById('chat-body');
  const wrap = document.createElement('div');
  wrap.className = 'options';
  opts.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'opt-btn';
    btn.textContent = opt.label;
    btn.onclick = () => {
      wrap.remove();
      addUserMsg(opt.label);
      onSelect(opt);
    };
    wrap.appendChild(btn);
  });
  body.appendChild(wrap);
  scrollBottom();
}

function showNameInput(onSubmit) {
  const body = document.getElementById('chat-body');
  const wrap = document.createElement('div');
  wrap.className = 'name-input-wrap';
  const input = document.createElement('input');
  input.className = 'name-input';
  input.placeholder = 'Escribe tu nombre...';
  input.maxLength = 50;
  const btn = document.createElement('button');
  btn.className = 'name-send';
  btn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>`;
  const submit = () => {
    const val = input.value.trim();
    if (!val) { input.focus(); return; }
    wrap.remove();
    addUserMsg(val);
    onSubmit(val);
  };
  btn.onclick = submit;
  input.onkeydown = e => { if (e.key === 'Enter') submit(); };
  wrap.appendChild(input);
  wrap.appendChild(btn);
  body.appendChild(wrap);
  scrollBottom();
  input.focus();
}

function showWAButton(message) {
  const body = document.getElementById('chat-body');
  const btn = document.createElement('button');
  btn.className = 'wa-btn';
  btn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.374 0 0 5.373 0 12c0 2.117.549 4.099 1.507 5.821L.057 23.998l6.335-1.652A11.95 11.95 0 0012 24c6.626 0 12-5.373 12-12S18.626 0 12 0zm0 21.9c-1.85 0-3.55-.5-5.02-1.37l-.36-.214-3.74.975.995-3.64-.234-.374A9.86 9.86 0 012.1 12c0-5.464 4.437-9.9 9.9-9.9 5.464 0 9.9 4.436 9.9 9.9 0 5.463-4.436 9.9-9.9 9.9z"/></svg>
    Continuar en WhatsApp`;
  btn.onclick = () => {
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank');
  };
  body.appendChild(btn);
  scrollBottom();
}

// ─── DATOS DE FLUJOS ─────────────────────────────────────────────────────────
const FLOWS = {
  '1a': {
    label: 'Asesoría Tributaria y Contable',
    questions: [
      { key: 'experiencia', q: '¿Actualmente ya cuenta con experiencia como contribuyente o está iniciando por primera vez?', opts: ['Tengo experiencia como contribuyente','Recién estoy iniciando mis actividades'] },
      { key: 'tipo_persona', q: '¿Cómo realiza su actividad actualmente?', opts: ['Persona natural','Empresa / sociedad','Aún no lo tengo definido'] },
      { key: 'tiempo_actividad', q: '¿Desde cuándo realiza su actividad económica?', opts: ['Recién inicié este año','Menos de 2 años','Entre 2 y 5 años','Más de 5 años'] },
      { key: 'motivo', q: '¿Cuál es el principal motivo por el que busca asesoría?', opts: ['Cumplir correctamente con mis obligaciones','Regularizar atrasos o errores','Iniciar actividades de forma correcta','Resolver una notificación o requerimiento','Asesoría general'] },
      { key: 'declaraciones', q: '¿Actualmente presenta sus declaraciones tributarias?', opts: ['Sí, de forma regular','Sí, pero con retrasos','No','No estoy seguro/a'] },
      { key: 'notificaciones', q: '¿Ha recibido notificaciones del SRI, IESS o Ministerio de Trabajo?', opts: ['Sí','No','No estoy seguro/a'] },
      { key: 'asesor_actual', q: '¿Cuenta con asesoría contable actualmente?', opts: ['Sí','No','Tuve antes, pero ya no'] },
      { key: 'comprobantes', q: '¿Emite comprobantes de venta?', opts: ['Sí, facturación electrónica','Sí, pero no electrónica','No emito comprobantes','No estoy seguro/a'] },
      { key: 'trabajadores', q: '¿Tiene trabajadores a su cargo?', opts: ['Sí','No','Planeo contratar'] },
      { key: 'tipo_apoyo', q: '¿Qué tipo de apoyo está buscando?', opts: ['Asesoría puntual','Acompañamiento mensual','Aún no lo tengo claro'] },
    ]
  },
  '1b': {
    label: 'Contabilidad para Personas Naturales y Empresas',
    questions: [
      { key: 'para_quien', q: '¿Para quién requiere el servicio de contabilidad?', opts: ['Persona natural','Empresa / sociedad'] },
      { key: 'lleva_conta', q: '¿Actualmente lleva su contabilidad?', opts: ['Sí, de forma regular','Sí, pero de manera parcial','No, necesito iniciar'] },
      { key: 'tiempo_actividad', q: '¿Desde cuándo realiza su actividad económica?', opts: ['Recién inicié este año','Menos de 2 años','Entre 2 y 5 años','Más de 5 años'] },
      { key: 'objetivo', q: '¿Qué busca con el servicio de contabilidad?', opts: ['Cumplir correctamente con mis obligaciones','Ordenar o regularizar mi información','Iniciar mi contabilidad desde cero','Revisar mi situación actual'] },
      { key: 'obligado', q: '¿Sabe si está obligado/a a llevar contabilidad?', opts: ['Sí','No','No estoy seguro/a'] },
      { key: 'declaraciones', q: '¿Presenta sus declaraciones tributarias?', opts: ['Sí, de forma mensual','Sí, semestral','No','No estoy seguro/a'] },
      { key: 'registro', q: '¿Lleva un registro de ingresos y gastos?', opts: ['Sí','No','De forma básica'] },
      { key: 'software', q: '¿Utiliza algún software contable?', opts: ['Sí','No','Planeo usar uno'] },
      { key: 'trabajadores', q: '¿Tiene trabajadores a su cargo?', opts: ['Sí','No','Planeo contratar'] },
      { key: 'tipo_servicio', q: '¿Qué tipo de servicio contable busca?', opts: ['Mensual','Puntual','Aún no lo tengo definido'] },
    ]
  },
  '1c': {
    label: 'Declaraciones por Internet',
    questions: [
      { key: 'para_quien', q: '¿Para quién requiere el servicio de declaraciones?', opts: ['Persona natural','Empresa / sociedad'] },
      { key: 'historial', q: '¿Ha presentado declaraciones tributarias anteriormente?', opts: ['Sí, de forma regular','Sí, pero con retrasos','No, nunca he declarado'] },
      { key: 'tipo_decl', q: '¿Qué declaraciones necesita presentar?', opts: ['IVA','Impuesto a la Renta','Anexos','No estoy seguro/a'] },
      { key: 'al_dia', q: '¿Sus declaraciones están al día?', opts: ['Sí','No','No estoy seguro/a'] },
      { key: 'atrasados', q: '¿Tiene periodos atrasados por declarar?', opts: ['Sí','No','No estoy seguro/a'] },
      { key: 'multas', q: '¿Ha generado multas o intereses por declaraciones tardías?', opts: ['Sí','No','No estoy seguro/a'] },
      { key: 'notificaciones', q: '¿Ha recibido notificaciones del SRI relacionadas con declaraciones?', opts: ['Sí','No','No estoy seguro/a'] },
      { key: 'tipo_apoyo', q: '¿Qué tipo de apoyo busca para sus declaraciones?', opts: ['Presentación puntual','Regularización de atrasos','Acompañamiento mensual','Aún no lo tengo claro'] },
      { key: 'info_lista', q: '¿Cuenta con la información necesaria para declarar?', opts: ['Sí','No','Parcial'] },
    ]
  },
  '1d': {
    label: 'Declaración de Anexos',
    questions: [
      { key: 'para_quien', q: '¿Para quién requiere la declaración de anexos?', opts: ['Persona natural','Empresa / sociedad'] },
      { key: 'historial', q: '¿Ha presentado anexos tributarios anteriormente?', opts: ['Sí','No','No estoy seguro/a'] },
      { key: 'tipo_anexo', q: '¿Qué anexos necesita declarar?', opts: ['ATS','ICE','PVP','Impuesto a la Renta','No estoy seguro/a'] },
      { key: 'al_dia', q: '¿Sus anexos están al día?', opts: ['Sí','No','No estoy seguro/a'] },
      { key: 'atrasados', q: '¿Tiene anexos atrasados por presentar?', opts: ['Sí','No','No estoy seguro/a'] },
      { key: 'notificaciones', q: '¿Ha recibido notificaciones del SRI relacionadas con anexos?', opts: ['Sí','No','No estoy seguro/a'] },
      { key: 'info_lista', q: '¿Cuenta con la información necesaria para elaborar los anexos?', opts: ['Sí','No','Parcial'] },
      { key: 'tipo_apoyo', q: '¿Qué tipo de apoyo busca para sus anexos?', opts: ['Presentación puntual','Regularización de atrasos','Acompañamiento mensual','Aún no lo tengo claro'] },
      { key: 'frecuencia', q: '¿Con qué frecuencia debe presentar anexos?', opts: ['Mensual','Anual','No lo sé'] },
    ]
  },
  '1e': {
    label: 'Declaración de Herencias, Legados y Donaciones',
    questions: [
      { key: 'tipo_decl', q: '¿Qué tipo de declaración necesita realizar?', opts: ['Herencia','Legado','Donación','No estoy seguro/a'] },
      { key: 'rol', q: '¿Usted es el beneficiario o quien realiza la donación?', opts: ['Beneficiario','Donante','Representante','No estoy seguro/a'] },
      { key: 'iniciado', q: '¿El trámite ya se encuentra iniciado?', opts: ['Sí','No','No estoy seguro/a'] },
      { key: 'en_plazo', q: '¿El trámite se encuentra dentro del plazo establecido?', opts: ['Sí','No','No estoy seguro/a'] },
      { key: 'tipo_bienes', q: '¿Qué tipo de bienes forman parte del trámite?', opts: ['Bienes inmuebles','Bienes muebles','Dinero','Varios tipos','No estoy seguro/a'] },
      { key: 'documentos', q: '¿Cuenta con la documentación necesaria?', opts: ['Sí','No','Parcial'] },
      { key: 'notificaciones', q: '¿Ha recibido notificaciones del SRI sobre este trámite?', opts: ['Sí','No','No estoy seguro/a'] },
      { key: 'tipo_apoyo', q: '¿Qué tipo de apoyo busca?', opts: ['Elaboración y presentación','Revisión del trámite','Acompañamiento completo','Aún no lo tengo claro'] },
      { key: 'cuando', q: '¿Cuándo ocurrió el fallecimiento o la donación?', opts: ['Recientemente','Hace menos de un año','Hace más de un año'] },
    ]
  },
  '1f': {
    label: 'Devolución del IVA e Impuesto a la Renta',
    questions: [
      { key: 'tipo_dev', q: '¿Qué tipo de devolución desea solicitar?', opts: ['IVA','Impuesto a la Renta','Ambas','No estoy seguro/a'] },
      { key: 'como', q: '¿Usted realiza la solicitud como?', opts: ['Persona natural','Empresa / sociedad'] },
      { key: 'iniciado', q: '¿El trámite de devolución ya ha sido iniciado?', opts: ['Sí','No','No estoy seguro/a'] },
      { key: 'periodo', q: '¿La devolución corresponde a qué periodo?', opts: ['Año actual','Año anterior','Varios periodos','No estoy seguro/a'] },
      { key: 'declaraciones_ok', q: '¿Las declaraciones relacionadas con la devolución están presentadas?', opts: ['Sí','No','Parcial'] },
      { key: 'notificaciones', q: '¿Ha recibido notificaciones del SRI por devoluciones?', opts: ['Sí','No','No estoy seguro/a'] },
      { key: 'documentos', q: '¿Cuenta con la documentación necesaria para el trámite?', opts: ['Sí','No','Parcial'] },
      { key: 'tipo_apoyo', q: '¿Qué tipo de apoyo busca?', opts: ['Gestión completa del trámite','Revisión de información','Acompañamiento','Aún no lo tengo claro'] },
      { key: 'anterior', q: '¿Ha solicitado devoluciones anteriormente?', opts: ['Sí','No'] },
    ]
  },
  '2a': {
    label: 'Asesoría Societaria',
    questions: [
      { key: 'empresa_estado', q: '¿Su consulta está relacionada con una empresa ya constituida o con una nueva?', opts: ['Empresa ya constituida','Nueva empresa','Aún no lo tengo definido'] },
      { key: 'tipo_asesoria', q: '¿Qué tipo de asesoría societaria necesita?', opts: ['Constitución de empresa','Actualización o reformas','Cumplimiento societario','Cierre o disolución','No estoy seguro/a'] },
      { key: 'tiempo_empresa', q: '¿Desde cuándo existe la empresa?', opts: ['Aún no está constituida','Menos de 2 años','Entre 2 y 5 años','Más de 5 años'] },
      { key: 'obligaciones_ok', q: '¿La empresa se encuentra al día con sus obligaciones societarias?', opts: ['Sí','No','No estoy seguro/a'] },
      { key: 'tipo_sociedad', q: '¿Qué tipo de sociedad es o desea constituir?', opts: ['SAS','Cía. Ltda.','S.A.','No estoy seguro/a'] },
      { key: 'rep_legal', q: '¿Cuenta con representante legal designado?', opts: ['Sí','No','No estoy seguro/a'] },
      { key: 'informes_super', q: '¿Presenta informes ante la Superintendencia de Compañías?', opts: ['Sí','No','No estoy seguro/a'] },
      { key: 'tipo_apoyo', q: '¿Qué tipo de acompañamiento busca?', opts: ['Trámite puntual','Asesoría permanente','Aún no lo tengo claro'] },
      { key: 'urgente', q: '¿Su trámite es urgente?', opts: ['Sí','No'] },
    ]
  },
  '2b': {
    label: 'Informes Anuales a la Superintendencia de Compañías',
    questions: [
      { key: 'empresa_activa', q: '¿Su empresa se encuentra actualmente activa?', opts: ['Sí','No','No estoy seguro/a'] },
      { key: 'periodo', q: '¿Para qué periodo requiere presentar el informe anual?', opts: ['Año actual','Año anterior','Varios periodos','No estoy seguro/a'] },
      { key: 'historial', q: '¿Ha presentado informes anuales anteriormente?', opts: ['Sí','No','No estoy seguro/a'] },
      { key: 'al_dia', q: '¿Su empresa se encuentra al día con la Superintendencia de Compañías?', opts: ['Sí','No','No estoy seguro/a'] },
      { key: 'tipo_informe', q: '¿Qué informe necesita presentar?', opts: ['Informe económico','Estados financieros','Informe de administración','No estoy seguro/a'] },
      { key: 'notificaciones', q: '¿Ha recibido notificaciones o multas de la Superintendencia?', opts: ['Sí','No','No estoy seguro/a'] },
      { key: 'info_lista', q: '¿Cuenta con la información contable necesaria?', opts: ['Sí','No','Parcial'] },
      { key: 'tipo_apoyo', q: '¿Qué tipo de apoyo busca?', opts: ['Elaboración y presentación','Revisión de información','Acompañamiento completo','Aún no lo tengo claro'] },
      { key: 'urgente', q: '¿El trámite es urgente?', opts: ['Sí','No'] },
    ]
  },
  '2c': {
    label: 'Informes y Manuales para la UAFE',
    questions: [
      { key: 'sujeto_obligado', q: '¿Su actividad económica está considerada como sujeto obligado ante la UAFE?', opts: ['Sí','No','No estoy seguro/a'] },
      { key: 'que_necesita', q: '¿Qué necesita elaborar o presentar ante la UAFE?', opts: ['Informes','Manuales','Ambos','No estoy seguro/a'] },
      { key: 'historial', q: '¿Ha presentado informes o manuales a la UAFE anteriormente?', opts: ['Sí','No','No estoy seguro/a'] },
      { key: 'al_dia', q: '¿Se encuentra al día con sus obligaciones ante la UAFE?', opts: ['Sí','No','No estoy seguro/a'] },
      { key: 'periodo', q: '¿Los informes corresponden a qué periodo?', opts: ['Periodo actual','Periodos anteriores','No estoy seguro/a'] },
      { key: 'notificaciones', q: '¿Ha recibido notificaciones o requerimientos de la UAFE?', opts: ['Sí','No','No estoy seguro/a'] },
      { key: 'info_lista', q: '¿Cuenta con la información necesaria?', opts: ['Sí','No','Parcial'] },
      { key: 'tipo_apoyo', q: '¿Qué tipo de apoyo busca?', opts: ['Elaboración y presentación','Revisión de documentación','Acompañamiento completo','Aún no lo tengo claro'] },
      { key: 'urgente', q: '¿El trámite es urgente?', opts: ['Sí','No'] },
    ]
  },
  '3a': {
    label: 'Asesoría Laboral y de Seguridad Social',
    questions: [
      { key: 'empleador', q: '¿Usted actúa como empleador?', opts: ['Sí','No','Estoy por iniciar'] },
      { key: 'trabajadores', q: '¿Tiene trabajadores a su cargo?', opts: ['Sí','No','Planeo contratar'] },
      { key: 'tipo_asesoria', q: '¿Qué tipo de asesoría laboral necesita?', opts: ['Cumplimiento laboral','Seguridad social (IESS)','Ambos','No estoy seguro/a'] },
      { key: 'al_dia', q: '¿Se encuentra al día con sus obligaciones laborales y de seguridad social?', opts: ['Sí','No','No estoy seguro/a'] },
      { key: 'afiliados', q: '¿Sus trabajadores están afiliados al IESS?', opts: ['Sí','No','Parcial'] },
      { key: 'contratos', q: '¿Cuenta con contratos, roles de pago y reglamentos?', opts: ['Sí','No','Parcial'] },
      { key: 'notificaciones', q: '¿Ha recibido notificaciones del IESS o del Ministerio de Trabajo?', opts: ['Sí','No','No estoy seguro/a'] },
      { key: 'tipo_apoyo', q: '¿Qué tipo de apoyo busca?', opts: ['Asesoría puntual','Acompañamiento permanente','Aún no lo tengo claro'] },
    ]
  },
  '3b': {
    label: 'Solución a Notificaciones del SRI, IESS y Ministerio de Trabajo',
    questions: [
      { key: 'entidad', q: '¿De qué entidad recibió la notificación?', opts: ['SRI','IESS','Ministerio de Trabajo','Más de una','No estoy seguro/a'] },
      { key: 'vigente', q: '¿La notificación se encuentra vigente?', opts: ['Sí','No','No estoy seguro/a'] },
      { key: 'cuando', q: '¿Cuándo recibió la notificación?', opts: ['Hace pocos días','Hace más de un mes','No estoy seguro/a'] },
      { key: 'tipo_noti', q: '¿La notificación indica multa, requerimiento o sanción?', opts: ['Sí','No','No estoy seguro/a'] },
      { key: 'gestion', q: '¿Ya ha realizado alguna gestión sobre esta notificación?', opts: ['Sí','No'] },
      { key: 'documentos', q: '¿Cuenta con la notificación y documentos relacionados?', opts: ['Sí','No','Parcial'] },
      { key: 'al_dia', q: '¿Se encuentra al día con sus obligaciones tributarias y laborales?', opts: ['Sí','No','No estoy seguro/a'] },
      { key: 'tipo_apoyo', q: '¿Qué tipo de apoyo busca?', opts: ['Respuesta y solución de la notificación','Revisión de la situación','Acompañamiento completo','Aún no lo tengo claro'] },
      { key: 'urgente', q: '¿Su caso es urgente?', opts: ['Sí','No'] },
    ]
  },
  '4a': {
    label: 'Facturación Electrónica',
    questions: [
      { key: 'comprobantes', q: '¿Actualmente emite comprobantes de venta?', opts: ['Sí, facturación electrónica','Sí, pero no electrónica','No emito comprobantes'] },
      { key: 'implementar', q: '¿Desea implementar la facturación electrónica?', opts: ['Sí','No','No estoy seguro/a'] },
      { key: 'como', q: '¿Usted factura como?', opts: ['Persona natural','Empresa / sociedad'] },
      { key: 'para_que', q: '¿Para qué necesita la facturación electrónica?', opts: ['Cumplir con el SRI','Iniciar actividades','Mejorar el control de ventas','No estoy seguro/a'] },
      { key: 'firma', q: '¿Cuenta con firma electrónica vigente?', opts: ['Sí','No','No estoy seguro/a'] },
      { key: 'frecuencia', q: '¿Con qué frecuencia emite facturas?', opts: ['Diariamente','Varias veces al mes','Ocasionalmente'] },
      { key: 'autorizados', q: '¿Sus comprobantes están autorizados por el SRI?', opts: ['Sí','No','No estoy seguro/a'] },
      { key: 'tipo_apoyo', q: '¿Qué tipo de apoyo busca?', opts: ['Implementación completa','Capacitación','Acompañamiento','Aún no lo tengo claro'] },
      { key: 'inmediato', q: '¿Necesita implementar la facturación electrónica de forma inmediata?', opts: ['Sí','No'] },
    ]
  },
  '4b': {
    label: 'Firma Electrónica',
    questions: [
      { key: 'tiene_firma', q: '¿Actualmente cuenta con firma electrónica?', opts: ['Sí, vigente','Sí, pero está vencida','No cuento con firma electrónica'] },
      { key: 'para_que', q: '¿Para qué necesita la firma electrónica?', opts: ['Facturación electrónica','Trámites ante el SRI','Trámites laborales o societarios','No estoy seguro/a'] },
      { key: 'para_quien', q: '¿La firma electrónica sería para?', opts: ['Persona natural','Empresa / sociedad'] },
      { key: 'urgencia', q: '¿Qué tan pronto necesita la firma electrónica?', opts: ['Lo antes posible','En los próximos días','Solo para información'] },
      { key: 'experiencia', q: '¿Ha utilizado antes firma electrónica?', opts: ['Sí','No'] },
      { key: 'dispositivo', q: '¿En qué la utilizaría principalmente?', opts: ['Computadora','Celular','Ambos'] },
      { key: 'tramite_especifico', q: '¿Necesita la firma para un trámite específico?', opts: ['Sí','No','Aún no lo sé'] },
      { key: 'tipo_apoyo', q: '¿Qué tipo de apoyo busca?', opts: ['Obtención de la firma electrónica','Renovación','Instalación y uso','Asesoría general'] },
      { key: 'acompanamiento', q: '¿Desea acompañamiento durante el proceso?', opts: ['Sí','No'] },
    ]
  },
  '4c': {
    label: 'Venta de Software Contable y Tributario',
    questions: [
      { key: 'para_quien', q: '¿El software sería para?', opts: ['Persona natural','Empresa / sociedad'] },
      { key: 'para_que', q: '¿Para qué necesita el software?', opts: ['Contabilidad','Declaraciones tributarias','Facturación electrónica','Todo lo anterior'] },
      { key: 'usa_actualmente', q: '¿Actualmente utiliza algún software contable?', opts: ['Sí','No','Uso uno, pero quiero cambiar'] },
      { key: 'nivel', q: '¿Qué nivel de conocimiento tiene en software contable?', opts: ['Básico','Intermedio','Avanzado'] },
      { key: 'movimientos', q: '¿Su actividad genera movimientos frecuentes?', opts: ['Sí','No','Ocasionalmente'] },
      { key: 'gestionar', q: '¿Qué desea gestionar con el software?', opts: ['Ingresos y gastos','Contabilidad completa','Impuestos y anexos','Todo'] },
      { key: 'usuarios', q: '¿Cuántas personas usarían el sistema?', opts: ['Solo una','De 2 a 3','Más de 3'] },
      { key: 'capacitacion', q: '¿Requiere capacitación o acompañamiento?', opts: ['Sí','No'] },
      { key: 'plataforma', q: '¿Prefiere el software en?', opts: ['Computadora','En la nube','No tengo preferencia'] },
    ]
  },
};

// ─── MENÚS ────────────────────────────────────────────────────────────────────
const MAIN_MENU = [
  { label: '1. Servicios Contables y Tributarios', key: '1' },
  { label: '2. Servicios Societarios y Corporativos', key: '2' },
  { label: '3. Servicios Laborales y de Seguridad Social', key: '3' },
  { label: '4. Servicios Tecnológicos y Digitales', key: '4' },
];

const SUB_MENUS = {
  '1': [
    { label: 'a. Asesoría tributaria y contable', key: '1a' },
    { label: 'b. Contabilidad para personas naturales y empresas', key: '1b' },
    { label: 'c. Declaraciones por internet', key: '1c' },
    { label: 'd. Declaración de anexos', key: '1d' },
    { label: 'e. Herencias, legados y donaciones', key: '1e' },
    { label: 'f. Devolución del IVA e Impuesto a la Renta', key: '1f' },
    { label: '↩ Atrás', key: 'back' },
  ],
  '2': [
    { label: 'a. Asesoría societaria', key: '2a' },
    { label: 'b. Informes anuales a la Superintendencia', key: '2b' },
    { label: 'c. Informes y manuales para la UAFE', key: '2c' },
    { label: '↩ Atrás', key: 'back' },
  ],
  '3': [
    { label: 'a. Asesoría laboral y de seguridad social', key: '3a' },
    { label: 'b. Solución a notificaciones del SRI, IESS y Ministerio de Trabajo', key: '3b' },
    { label: '↩ Atrás', key: 'back' },
  ],
  '4': [
    { label: 'a. Facturación electrónica', key: '4a' },
    { label: 'b. Firma electrónica', key: '4b' },
    { label: 'c. Venta de software contable y tributario', key: '4c' },
    { label: '↩ Atrás', key: 'back' },
  ],
};

// ─── LÓGICA DE CONVERSACIÓN ───────────────────────────────────────────────────
async function startConversation() {
  await addBotMsg('👋 ¡Buenos días! Me comunico con el <b>Bot GYG</b>.<br>¿En qué le podemos ayudar hoy?');
  await askName();
}

async function askName() {
  await addBotMsg('Para comenzar, ¿cuál es su nombre?');
  showNameInput(async (name) => {
    userName = name;
    answers = {};
    await addBotMsg(`¡Mucho gusto, <b>${userName}</b>! 😊 Seleccione el servicio que necesita:`);
    showMainMenu();
  });
}
function showMainMenu() {
  showOptions(MAIN_MENU, async (opt) => {
    answers.categoria = opt.label;
    await addBotMsg(`Ha seleccionado: <b>${opt.label}</b><br>¿Qué subservicio le interesa?`);
    showSubMenu(opt.key);
  });
}
function showSubMenu(catKey) {
  showOptions(SUB_MENUS[catKey], async (opt) => {
    if (opt.key === 'back') {
      await addBotMsg('De acuerdo, regresemos al menú principal:');
      showMainMenu();
      return;
    }
    answers.servicio = opt.label;
    currentFlow = FLOWS[opt.key];
    if (!currentFlow) return;
    await addBotMsg(`Perfecto. Voy a hacerle algunas preguntas sobre <b>${currentFlow.label}</b> para conectarle con el asesor más adecuado.`);
    runFlow(0);
  });
}

function runFlow(idx) {
  if (idx >= currentFlow.questions.length) {
    finishFlow();
    return;
  }
  const q = currentFlow.questions[idx];
  addBotMsg(q.q).then(() => {
    showOptions(q.opts.map(o => ({ label: o, key: o })), async (opt) => {
      answers[q.key] = opt.key;
      runFlow(idx + 1);
    });
  });
}

async function finishFlow() {
  await addBotMsg('¡Gracias por la información! 🎉<br>Voy a conectarle con uno de nuestros asesores en WhatsApp para continuar.');
  const msg = buildWAMessage();
  showWAButton(msg);
  await new Promise(r => setTimeout(r, 600));
  await addBotMsg('¿Desea consultar algo más?');
  showOptions([
    { label: '🔄 Volver al menú principal', key: 'main' },
  ], async () => {
    answers = {};
    currentFlow = null;
    await addBotMsg(`¡Con gusto! Aquí el menú principal, <b>${userName}</b>:`);
    showMainMenu();
  });
}

// ─── CONSTRUCCIÓN DEL MENSAJE PARA WHATSAPP ───────────────────────────────────
function buildWAMessage() {
  const serviceMap = {
    experiencia: 'experiencia como contribuyente',
    tipo_persona: 'tipo de persona',
    tiempo_actividad: 'tiempo de actividad',
    motivo: 'motivo de consulta',
    declaraciones: 'situación de declaraciones',
    notificaciones: 'notificaciones recibidas',
    asesor_actual: 'asesoría actual',
    comprobantes: 'emisión de comprobantes',
    trabajadores: 'trabajadores a cargo',
    tipo_apoyo: 'tipo de apoyo buscado',
    para_quien: 'solicitante',
    lleva_conta: 'estado de contabilidad',
    objetivo: 'objetivo',
    obligado: 'obligado a llevar contabilidad',
    registro: 'registro de ingresos/gastos',
    software: 'software actual',
    tipo_servicio: 'tipo de servicio',
    historial: 'historial',
    tipo_decl: 'tipo de declaración',
    al_dia: 'estado al día',
    atrasados: 'periodos atrasados',
    multas: 'multas generadas',
    tipo_anexo: 'tipo de anexo',
    frecuencia: 'frecuencia',
    rol: 'rol en el trámite',
    iniciado: 'trámite iniciado',
    en_plazo: 'dentro del plazo',
    tipo_bienes: 'tipo de bienes',
    documentos: 'documentación disponible',
    cuando: 'fecha del evento',
    tipo_dev: 'tipo de devolución',
    como: 'condición del solicitante',
    periodo: 'periodo',
    declaraciones_ok: 'estado de declaraciones relacionadas',
    anterior: 'trámites anteriores',
    empresa_estado: 'estado de la empresa',
    tipo_asesoria: 'tipo de asesoría',
    tiempo_empresa: 'antigüedad de la empresa',
    obligaciones_ok: 'cumplimiento de obligaciones',
    tipo_sociedad: 'tipo de sociedad',
    rep_legal: 'representante legal',
    informes_super: 'informes a la Superintendencia',
    urgente: 'urgencia',
    empresa_activa: 'empresa activa',
    tipo_informe: 'tipo de informe',
    info_lista: 'información disponible',
    sujeto_obligado: 'sujeto obligado UAFE',
    que_necesita: 'necesidad específica',
    empleador: 'condición de empleador',
    afiliados: 'afiliación IESS',
    contratos: 'contratos y documentos',
    entidad: 'entidad notificante',
    vigente: 'notificación vigente',
    tipo_noti: 'tipo de notificación',
    gestion: 'gestiones realizadas',
    implementar: 'desea implementar',
    para_que: 'propósito',
    firma: 'firma electrónica',
    autorizados: 'comprobantes autorizados',
    inmediato: 'implementación inmediata',
    tiene_firma: 'estado de firma',
    urgencia: 'urgencia',
    dispositivo: 'dispositivo de uso',
    tramite_especifico: 'trámite específico',
    acompanamiento: 'desea acompañamiento',
    usa_actualmente: 'software actual',
    nivel: 'nivel de conocimiento',
    movimientos: 'frecuencia de movimientos',
    gestionar: 'necesidad de gestión',
    usuarios: 'número de usuarios',
    capacitacion: 'capacitación requerida',
    plataforma: 'plataforma preferida',
  };

  const skip = ['categoria', 'servicio'];
  const lines = [
    `¡Buen día! Mi nombre es *${userName}* y me comunico porque estoy interesado/a en sus servicios de *${answers.servicio || currentFlow?.label || 'asesoría'}*.`,
    '',
    'A continuación le comparto los detalles de mi caso:',
    '',
  ];

  for (const [key, val] of Object.entries(answers)) {
    if (skip.includes(key)) continue;
    const label = serviceMap[key] || key;
    lines.push(`• *${capitalize(label)}:* ${val}`);
  }

  lines.push('', 'Quedo a la espera de su atención. ¡Gracias!');
  return lines.join('\n');
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}