document.addEventListener('DOMContentLoaded', () => {
  const buscador = document.getElementById('buscador');
  const chkNacional = document.getElementById('filtro-nacional');
  const chkWhite = document.getElementById('filtro-white');
  const chkAPI = document.getElementById('filtro-api');
  const resultadosDiv = document.getElementById('resultados');
  const fechaSpan = document.getElementById('fecha-upd');

  // Cargar proveedores
  fetch('proveedores.json')
    .then(res => res.json())
    .then(proveedores => {
      // Mostrar última fecha de verificación (del más reciente)
      const fechas = proveedores.map(p => new Date(p.fecha_verif));
      const ultima = new Date(Math.max(...fechas));
      fechaSpan.textContent = ultima.toLocaleDateString('es-PE');

      // Render inicial
      render(proveedores);

      // Eventos
      buscador.addEventListener('input', () => render(proveedores));
      chkNacional.addEventListener('change', () => render(proveedores));
      chkWhite.addEventListener('change', () => render(proveedores));
      chkAPI.addEventListener('change', () => render(proveedores));
    });

  function render(data) {
    const termino = buscador.value.trim().toLowerCase();
    let filtrados = data;

    // Búsqueda
    if (termino) {
      filtrados = filtrados.filter(p => 
        p.nombre.toLowerCase().includes(termino) ||
        p.rubro.toLowerCase().includes(termino) ||
        p.descripcion.toLowerCase().includes(termino)
      );
    }

    // Filtros
    if (chkNacional.checked) {
      filtrados = filtrados.filter(p => p.cobertura === 'Nacional');
    }
    if (chkWhite.checked) {
      filtrados = filtrados.filter(p => p.white_label === true);
    }
    if (chkAPI.checked) {
      filtrados = filtrados.filter(p => p.api === true || p.excel_actualizable === true);
    }

    // Ordenar: verificados primero, luego por margen
    filtrados.sort((a, b) => {
      if (a.verificado !== b.verificado) return b.verificado - a.verificado;
      return (b.margen_estimado.split('–')[0] || 0) - (a.margen_estimado.split('–')[0] || 0);
    });

    // Render HTML
    if (filtrados.length === 0) {
      resultadosDiv.innerHTML = `<p class="mensaje-inicial">🔎 No hay proveedores que coincidan con los filtros. Prueba con otro término.</p>`;
      return;
    }

    let html = `<h2>✅ ${filtrados.length} proveedor(es) encontrados</h2>`;
    
    filtrados.forEach(p => {
      const badgeVerif = p.verificado ? `<span class="rubro">✔️ Verificado</span>` : '';
      const badgeWL = p.white_label ? '✅' : '❌';
      const badgeAPI = p.api || p.excel_actualizable ? '✅' : '❌';
      const fecha = new Date(p.fecha_verif).toLocaleDateString('es-PE');

      html += `
        <div class="tarjeta">
          <h3>${p.nombre} ${badgeVerif}</h3>
          <span class="rubro">${p.rubro}</span>
          <p class="descripcion">${p.descripcion}</p>
          
          <div class="info">
            <div class="info-item"><strong>Cobertura:</strong> ${p.cobertura}</div>
            <div class="info-item"><strong>White label:</strong> ${badgeWL}</div>
            <div class="info-item"><strong>API/Excel:</strong> ${badgeAPI}</div>
            <div class="info-item"><strong>Tiempo:</strong> ${p.tiempo_envio}</div>
            <div class="info-item"><strong>Margen:</strong> ${p.margen_estimado}</div>
            <div class="info-item"><strong>Verif.:</strong> ${fecha}</div>
          </div>
          
          <a href="${p.web}" target="_blank" class="btn">🌐 Visitar sitio</a>
          <a href="mailto:${p.contacto}" class="btn" style="background:#1976d2;margin-left:0.5rem">✉️ Contactar</a>
        </div>
      `;
    });

    resultadosDiv.innerHTML = html;
  }
});
