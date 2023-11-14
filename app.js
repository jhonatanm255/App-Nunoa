

function crearPropiedad() {
  const nombre = document.getElementById('nombre').value;
  const depto = document.getElementById('depto').value;
  const estacionamiento = document.getElementById('est').value;
  const bodega = document.getElementById('bodega').value;

  if(nombre === '' || depto === '' || estacionamiento === '' || bodega === ''){
    alert('Complete todos los campos');
    return false;
  }

  const propiedad = {
      nombre: nombre,
      depto: depto,
      estacionamiento: estacionamiento,
      bodega: bodega
  };

  

  // Obtener las propiedades existentes
  let propiedades = JSON.parse(localStorage.getItem('propiedades')) || [];

  // Agregar la nueva propiedad
  propiedades.push(propiedad);

  // Guardar en localStorage
  localStorage.setItem('propiedades', JSON.stringify(propiedades));
}

function leerPropiedades() {
  // Obtener las propiedades almacenadas
  const propiedades = JSON.parse(localStorage.getItem('propiedades')) || [];

  // Mostrar las propiedades en la consola
  alert(propiedades);
}

function buscarPropiedad() {
  // Obtener los valores de búsqueda desde los campos correspondientes
  const nombre = document.getElementById('nombre').value.toLowerCase();
  const depto = document.getElementById('depto').value.toLowerCase();
  const estacionamiento = document.getElementById('est').value.toLowerCase();
  const bodega = document.getElementById('bodega').value.toLowerCase();

  // Obtener las propiedades almacenadas
  const propiedades = JSON.parse(localStorage.getItem('propiedades')) || [];

  // Filtrar las propiedades por cualquier campo que contenga el valor proporcionado
  const propiedadesEncontradas = propiedades.filter(propiedad =>
      (nombre === '' || propiedad.nombre.toLowerCase().includes(nombre)) &&
      (depto === '' || propiedad.depto.toLowerCase() === (depto)) &&
      (estacionamiento === '' || propiedad.estacionamiento.toString().includes(estacionamiento)) &&
      (bodega === '' || propiedad.bodega.toString().includes(bodega))
  );

  // Mostrar los resultados en la interfaz
  mostrarResultados(propiedadesEncontradas);
}

function mostrarResultados(resultados) {
  const resultadosDiv = document.getElementById('resultados');
  const tarjetaFlotante = document.getElementById('tarjetaFlotante');

  // Limpiar el área de resultados antes de mostrar nuevos resultados
  resultadosDiv.innerHTML = '';

  if (resultados.length > 0) {
      // Iterar sobre los resultados y crear tarjetas para cada uno
      resultados.forEach(resultado => {
          const tarjeta = document.createElement('div');
          tarjeta.classList.add('tarjeta'); // Puedes agregar clases CSS para estilizar la tarjeta

          // Crear contenido de la tarjeta
          const contenidoTarjeta = `
              <p><b>Nombre:</b> ${resultado.nombre}</p><br>
              <p><b>Depto:</b> ${resultado.depto}</p><br>
              <p><b>Estacionamiento:</b> ${resultado.estacionamiento}</p><br>
              <p><b>Bodega:</b> ${resultado.bodega}</p><br>
          `;

          // Agregar contenido a la tarjeta
          tarjeta.innerHTML = contenidoTarjeta;

          // Agregar la tarjeta al área de resultados
          resultadosDiv.appendChild(tarjeta);
      });

      // Mostrar la tarjeta flotante
      tarjetaFlotante.style.display = 'block';
  } else {
      // Mostrar mensaje si no se encontraron propiedades
      resultadosDiv.textContent = 'No se encontraron propiedades que coincidan con el valor proporcionado';
      // Ocultar la tarjeta flotante si no hay resultados
      tarjetaFlotante.style.display = 'none';
  }
}

function cerrarTarjeta() {
  const tarjetaFlotante = document.getElementById('tarjetaFlotante');
  tarjetaFlotante.style.display = 'none';
}

  

 
