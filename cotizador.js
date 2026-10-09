/* =====================================================
   cotizador.js — Lógica del cotizador de cámaras de seguridad
   =====================================================

   Tipos de cámara disponibles:
     - Metálica con audio    (cam-metal-audio)
     - Metálica sin audio    (cam-metal-sin)
     - Plástica con audio    (cam-plas-audio)
     - Plástica sin audio    (cam-plas-sin)

   Regla del grabador (DVR):
     - 0  cámaras → sin grabador
     - 1–4 cámaras → grabador de 4 canales
     - 5–8 cámaras → grabador de 8 canales
     - Límite máximo total: 8 cámaras

   El botón envía los datos al WhatsApp del técnico
   y muestra al cliente un modal de "en espera de cotización".
   ===================================================== */

(function () {
  /* --- Número destino de WhatsApp (sin + ni espacios) --- */
  const WA_NUMBER = '584125550101';

  /* --- Referencias al DOM --- */
  const contadores = {
    'cam-metal-audio': document.getElementById('cam-metal-audio'),
    'cam-metal-sin':   document.getElementById('cam-metal-sin'),
    'cam-plas-audio':  document.getElementById('cam-plas-audio'),
    'cam-plas-sin':    document.getElementById('cam-plas-sin'),
  };

  const etiquetas = {
    'cam-metal-audio': 'Metálica con audio',
    'cam-metal-sin':   'Metálica sin audio',
    'cam-plas-audio':  'Plástica con audio',
    'cam-plas-sin':    'Plástica sin audio',
  };

  const dvrIconEl  = document.getElementById('dvr-icon');
  const dvrTitleEl = document.getElementById('dvr-title');
  const dvrDescEl  = document.getElementById('dvr-desc');
  const alertEl    = document.getElementById('cot-alert');
  const btnEnviar  = document.getElementById('btn-cot-enviar');
  const modalEl    = document.getElementById('modal-espera');
  const modalCloseEl = document.getElementById('modal-close');

  /* --- Suma total de cámaras --- */
  function totalCamaras() {
    return Object.values(contadores).reduce((sum, el) => sum + parseInt(el.textContent, 10), 0);
  }

  /* --- Determina qué grabador se necesita --- */
  function tipoGrabador(total) {
    if (total === 0) return null;
    return total <= 4 ? 4 : 8;
  }

  /* --- Actualiza el panel del grabador y la alerta --- */
  function actualizarResumen() {
    const total = totalCamaras();
    const dvr   = tipoGrabador(total);

    // Mostrar u ocultar alerta de límite
    if (total >= 8) {
      alertEl.textContent = '⚠️ Has alcanzado el límite máximo de 8 cámaras (grabador de 8 canales).';
      alertEl.classList.add('visible');
    } else {
      alertEl.classList.remove('visible');
    }

    // Panel informativo del grabador
    if (dvr === null) {
      dvrIconEl.textContent  = '📦';
      dvrTitleEl.textContent = 'Sin grabador requerido';
      dvrDescEl.textContent  = 'Agrega al menos una cámara para conocer el grabador necesario.';
    } else if (dvr === 4) {
      dvrIconEl.textContent  = '🖥️';
      dvrTitleEl.textContent = 'Grabador de 4 canales (DVR 4CH)';
      dvrDescEl.textContent  = `Con ${total} cámara${total > 1 ? 's' : ''} necesitas un DVR de 4 canales. Capacidad disponible: ${4 - total} puerto${(4 - total) !== 1 ? 's' : ''} libre${(4 - total) !== 1 ? 's' : ''}.`;
    } else {
      dvrIconEl.textContent  = '🖥️';
      dvrTitleEl.textContent = 'Grabador de 8 canales (DVR 8CH)';
      dvrDescEl.textContent  = `Con ${total} cámara${total > 1 ? 's' : ''} necesitas un DVR de 8 canales. Capacidad disponible: ${8 - total} puerto${(8 - total) !== 1 ? 's' : ''} libre${(8 - total) !== 1 ? 's' : ''}.`;
    }

    // Habilitar/deshabilitar botón de envío
    btnEnviar.disabled = total === 0;
  }

  /* --- Manejadores de los botones +/- de cada cámara --- */
  document.querySelectorAll('.cam-btn-minus').forEach(btn => {
    btn.addEventListener('click', () => {
      const id  = btn.dataset.cam;
      const el  = contadores[id];
      const val = parseInt(el.textContent, 10);
      if (val > 0) {
        el.textContent = val - 1;
        actualizarResumen();
      }
    });
  });

  document.querySelectorAll('.cam-btn-plus').forEach(btn => {
    btn.addEventListener('click', () => {
      const id    = btn.dataset.cam;
      const el    = contadores[id];
      const val   = parseInt(el.textContent, 10);
      const total = totalCamaras();

      if (total >= 8) return; // límite máximo
      el.textContent = val + 1;
      actualizarResumen();
    });
  });

  /* --- Envío de la solicitud de cotización por WhatsApp --- */
  btnEnviar.addEventListener('click', () => {
    const nombre = document.getElementById('cot-nombre').value.trim();
    const zona   = document.getElementById('cot-zona').value.trim();
    const total  = totalCamaras();
    const dvr    = tipoGrabador(total);

    if (!nombre) {
      alert('Por favor ingresa tu nombre antes de continuar.');
      document.getElementById('cot-nombre').focus();
      return;
    }
    if (total === 0) {
      alert('Por favor selecciona al menos una cámara.');
      return;
    }

    // Armar detalle de cámaras
    const detalle = Object.entries(contadores)
      .filter(([, el]) => parseInt(el.textContent, 10) > 0)
      .map(([id, el]) => `  • ${etiquetas[id]}: ${el.textContent}`)
      .join('\n');

    const mensaje =
      `🎥 *Solicitud de cotización - Cámaras de seguridad*\n\n` +
      `👤 *Nombre:* ${nombre}\n` +
      (zona ? `📍 *Zona / Dirección:* ${zona}\n` : '') +
      `\n📷 *Cámaras solicitadas (${total} en total):*\n${detalle}\n` +
      `\n🖥️ *Grabador requerido:* DVR de ${dvr} canales\n` +
      `\nQuedo en espera de la cotización completa. ¡Gracias!`;

    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');

    // Mostrar modal de espera al cliente
    modalEl.classList.add('active');
  });

  /* --- Cerrar modal --- */
  modalCloseEl.addEventListener('click', () => {
    modalEl.classList.remove('active');
  });

  // También se cierra haciendo clic fuera del cuadro
  modalEl.addEventListener('click', (e) => {
    if (e.target === modalEl) modalEl.classList.remove('active');
  });

  /* --- Inicializar resumen al cargar la página --- */
  actualizarResumen();

})();
