// Cargar datos y escuchar eventos
document.addEventListener('DOMContentLoaded', () => {
  const buscador = document.getElementById('buscador');
  const btnBuscar = document.getElementById('btn-buscar');
  const resultadosDiv = document.getElementById('resultados');
  const fechaSpan = document.getElementById('fecha-actualizacion');

  // Cargar datos desde productos.json
  fetch('productos.json')
    .then(response => response.json())
    .then(data => {
      // Mostrar última fecha de actualización (del primer producto)
      if (data.length > 0) {
        const ultimaFecha = new Date(data[0].fecha).toLocaleDateString('es-PE');
        fechaSpan.textContent = ultimaFecha;
      }

      // Buscar al hacer clic
      btnBuscar.addEventListener('click', () => buscarProducto(data));
      
      // También permitir Enter
      buscador.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') buscarProducto(data);
      });
    })
    .catch(err => {
      resultadosDiv.innerHTML = `<p class="mensaje-inicial" style="color:#d32f2f">❌ Error al cargar los datos. ¿Subiste 'productos.json'?</p>`;
      console.error('Error:', err);
    });

  function buscarProducto(data) {
    const termino = buscador.value.trim().toLowerCase();
    
    if (!termino) {
      resultadosDiv.innerHTML = `<p class="mensaje-inicial">Escribe un producto para buscar 🛒</p>`;
      return;
    }

    // Filtrar productos (coincidencia parcial, insensible a mayúsculas/acentos)
    const resultados = data.filter(item => 
      normalize(item.producto).includes(normalize(termino))
    );

    if (resultados.length === 0) {
      resultadosDiv.innerHTML = `<p class="mensaje-inicial">🔎 No se encontraron resultados para "<strong>${termino}</strong>". Prueba con otro término.</p>`;
      return;
    }

    // Ordenar por precio ascendente
    resultados.sort((a, b) => a.precio - b.precio);

    // Generar HTML
    let html = `<h2>✅ Encontramos ${resultados.length} opción(es)</h2>`;
    
    resultados.forEach(item => {
      const fecha = new Date(item.fecha).toLocaleDateString('es-PE');
      html += `
        <div class="tarjeta">
          <div>
            <div class="tienda">${item.tienda}</div>
            <div>${item.producto}</div>
            <small>Actualizado: ${fecha}</small>
          </div>
          <div>
            <div class="precio">S/ ${item.precio.toFixed(2)}</div>
            <a href="${item.url}" target="_blank" class="enlace-btn">Ver en tienda</a>
          </div>
        </div>
      `;
    });

    resultadosDiv.innerHTML = html;
  }

  // Función para normalizar texto (eliminar acentos y minúsculas)
  function normalize(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }
});
