

function crearPropiedad() {
  const nombre = document.getElementById('nombre').value;
  const depto = document.getElementById('depto').value;
  const estacionamiento = document.getElementById('est').value;
  const bodega = document.getElementById('bodega').value;

  if (nombre === '' || depto === '' || estacionamiento === '' || bodega === '') {
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

  // Mostrar la ventana flotante
  mostrarVentanaFlotante('Registro satisfactorio');

  // Limpiar los campos después de agregar el registro
  limpiarCampos();

  return true;
}

function mostrarVentanaFlotante(mensaje) {
  const ventanaFlotante = document.getElementById('ventanaFlotante');
  const mensajeFlotante = document.getElementById('mensajeFlotante');

  // Mostrar el mensaje en la ventana flotante
  mensajeFlotante.textContent = mensaje;

  // Mostrar la ventana flotante
  ventanaFlotante.style.display = 'block';

  // Ocultar la ventana flotante después de 2 segundos
  setTimeout(function () {
    ventanaFlotante.style.display = 'none';
  }, 2000);
}

function limpiarCampos() {
  // Limpiar los campos después de agregar el registro
  document.getElementById('nombre').value = '';
  document.getElementById('depto').value = '';
  document.getElementById('est').value = '';
  document.getElementById('bodega').value = '';
}


function leerPropiedades() {
  // Obtener las propiedades almacenadas
  const propiedades = JSON.parse(localStorage.getItem('propiedades')) || [];

  // Referencia al contenedor donde se mostrarán las propiedades
  const resultadosContainer = document.getElementById('resultados');

  // Limpiar el área de resultados antes de mostrar nuevos resultados
  resultadosContainer.innerHTML = '';

  if (propiedades.length > 0) {
    // Crear una lista ul para mostrar las propiedades
    const listaPropiedades = document.createElement('ul');
    listaPropiedades.classList.add('resultados-lista'); 

    // Iterar sobre las propiedades y agregar cada una a la lista
    propiedades.forEach(propiedad => {
      const li = document.createElement('li');

      // Contenido de cada propiedad
      const contenidoPropiedad = `
        <p><b>Nombre:</b> ${propiedad.nombre}</p>
        <p><b>Depto:</b> ${propiedad.depto}</p>
        <p><b>Estacionamiento:</b> ${propiedad.estacionamiento}</p>
        <p><b>Bodega:</b> ${propiedad.bodega}</p>
      `;

      li.innerHTML = contenidoPropiedad;

      // Agregar espacio entre propiedades con margen bottom
      li.style.marginBottom = '10px';

      // Agregar el elemento li a la lista
      listaPropiedades.appendChild(li);
    });

    // Agregar la lista al contenedor de resultados
    resultadosContainer.appendChild(listaPropiedades);
  } else {
    // Mostrar mensaje si no hay propiedades almacenadas
    resultadosContainer.textContent = 'No hay propiedades almacenadas.';
  }

  // Mostrar el botón de cerrar
  const cerrarBtn = document.createElement('button');
  cerrarBtn.textContent = 'Cerrar';
  cerrarBtn.className = 'cerrar-btn';
  cerrarBtn.onclick = cerrarTarjeta;

  // Ocultar los botones de editar y borrar
  const btnEditElim = document.querySelector('.btn-edit-elim');
  btnEditElim.style.display = 'none';

  // Mostrar la tarjeta flotante
  const tarjetaFlotante = document.getElementById('tarjetaFlotante');
  tarjetaFlotante.style.display = 'block';
}


function buscarPropiedad() {
  // Obtener los valores de búsqueda desde los campos correspondientes
  const nombre = document.getElementById('nombre').value.toLowerCase();
  const depto = document.getElementById('depto').value.toLowerCase();
  const estacionamiento = document.getElementById('est').value.toLowerCase();
  const bodega = document.getElementById('bodega').value.toLowerCase();

  // Obtener las propiedades almacenadas
  const propiedades = JSON.parse(localStorage.getItem('propiedades')) || [];

  if (nombre === '' && depto === '' && estacionamiento === '' && bodega === '') {
    alert('Ingrese al menos un criterio de búsqueda');
    return;
  }

  // Filtrar las propiedades por cualquier campo que contenga el valor proporcionado
  const propiedadesEncontradas = propiedades.filter(propiedad =>
      (nombre === '' || propiedad.nombre.toLowerCase().includes(nombre)) &&
      (depto === '' || propiedad.depto.toLowerCase() === (depto)) &&
      (estacionamiento === '' || propiedad.estacionamiento.toString().includes(estacionamiento)) &&
      (bodega === '' || propiedad.bodega.toString().includes(bodega))
  );

  const btnEditElim = document.querySelector('.btn-edit-elim');
  btnEditElim.style.display = 'flex';

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
          tarjeta.classList.add('tarjeta');

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

// Función para refrescar la página
function refrescarPagina() {
  location.reload();
}

// Modificar el evento onclick del botón de refresh en tu función leerPropiedades()
function leerPropiedades() {

  // Botón de refresh
  const btnRefresh = document.querySelector('.nav li:last-child');
  btnRefresh.onclick = refrescarPagina;
}

