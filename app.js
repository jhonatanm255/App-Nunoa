
//CREAR REGISTRO NUEVO
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

//LEER LOS REGISTROS
function leerPropiedades() {

  const propiedades = JSON.parse(localStorage.getItem('propiedades')) || [];
  const resultadosContainer = document.getElementById('resultados');

  // Limpiar el área de resultados antes de mostrar nuevos resultados
  resultadosContainer.innerHTML = '';

  if (propiedades.length > 0) {
    const listaPropiedades = document.createElement('ul');
    listaPropiedades.classList.add('resultados-lista'); 

    // Iterar sobre las propiedades y agregar cada una a la lista
    propiedades.forEach(propiedad => {
      const li = document.createElement('li');

      const contenidoPropiedad = `
        <p><b>Nombre:</b> ${propiedad.nombre}</p>
        <p><b>Depto:</b> ${propiedad.depto}</p>
        <p><b>Estacionamiento:</b> ${propiedad.estacionamiento}</p>
        <p><b>Bodega:</b> ${propiedad.bodega}</p>
      `;

      li.innerHTML = contenidoPropiedad;

      // Agregar espacio entre propiedades con margen bottom
      li.style.marginBottom = '15px';
      

      // Agregar el elemento li a la lista
      listaPropiedades.appendChild(li);
      li.style.backgroundColor = 'rgb(220, 220, 220)';
      li.style.borderRadius = '10px';
      li.style.padding = '10px';
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

//BUSCAR REGISTROS
function buscarPropiedad() {
  
  const nombre = document.getElementById('nombre').value.toLowerCase();
  const depto = document.getElementById('depto').value.toLowerCase();
  const estacionamiento = document.getElementById('est').value.toLowerCase();
  const bodega = document.getElementById('bodega').value.toLowerCase();

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

          const contenidoTarjeta = `
              <p><b>Nombre:</b> ${resultado.nombre}</p><br>
              <p><b>Depto:</b> ${resultado.depto}</p><br>
              <p><b>Estacionamiento:</b> ${resultado.estacionamiento}</p><br>
              <p><b>Bodega:</b> ${resultado.bodega}</p><br>
          `;
          tarjeta.innerHTML = contenidoTarjeta;
          

          // Agregar la tarjeta al área de resultados
          resultadosDiv.appendChild(tarjeta);
          
      });

      // Mostrar la tarjeta flotante
      tarjetaFlotante.style.display = 'block';
  } else {
    
      resultadosDiv.textContent = 'No se encontraron registros asociados';
      tarjetaFlotante.style.display = 'block';

      const btnEditElim = document.querySelector('.btn-edit-elim');
      btnEditElim.style.display = 'none';
  }
}

function cerrarTarjeta() {
  const tarjetaFlotante = document.getElementById('tarjetaFlotante');
  tarjetaFlotante.style.display = 'none';

  // Restablecer la posición del formulario de búsqueda
  const formularioBusqueda = document.getElementById('formularioBusqueda');
  formularioBusqueda.style.marginTop = '0';
}


// FUNCION PARA REFRESCAR APP
function refrescarPagina() {
  location.reload();

  const btnRefresh = document.querySelector('.nav li:last-child');
  btnRefresh.onclick = refrescarPagina;
}
//EDITAR REGISTROS
function editarPropiedad() {
  // Obtener el depto de la propiedad seleccionada
  const deptoSeleccionado = document.getElementById('depto').value;

  // Obtener las propiedades almacenadas
  const propiedades = JSON.parse(localStorage.getItem('propiedades')) || [];

  // Buscar la propiedad con el depto seleccionado
  const propiedadAEditar = propiedades.find(propiedad => propiedad.depto === deptoSeleccionado);

  // Mostrar el formulario de edición
  mostrarFormularioEdicion(propiedadAEditar);
}

//ELIMINAR REGISTROS
function eliminarPropiedad() {

  const deptoSeleccionado = document.getElementById('depto').value;
  let propiedades = JSON.parse(localStorage.getItem('propiedades')) || [];
  propiedades = propiedades.filter(propiedad => propiedad.depto !== deptoSeleccionado);
  localStorage.setItem('propiedades', JSON.stringify(propiedades));

  // Ocultar la ventana de editar y borrar
  const btnEditElim = document.querySelector('.btn-edit-elim');
  btnEditElim.style.display = 'none';

  // Mostrar la ventana flotante de eliminación satisfactoria
  mostrarVentanaFlotante('Propiedad eliminada satisfactoriamente');
  limpiarCampos();
  cerrarTarjeta();
}

function mostrarVentanaFlotante(mensaje) {
  const ventanaFlotante = document.getElementById('ventanaFlotante');
  const mensajeFlotante = document.getElementById('mensajeFlotante');

  // Mostrar el mensaje en la ventana flotante
  mensajeFlotante.textContent = mensaje;

  // Mostrar la ventana flotante
  ventanaFlotante.style.display = 'block';
  setTimeout(function () {
      ventanaFlotante.style.display = 'none';
  }, 2000);
}

//FORMULARIO EDICION
function mostrarFormularioEdicion(propiedad) {
  // Ocultar la tarjeta flotante
  const tarjetaFlotante = document.getElementById('tarjetaFlotante');
  tarjetaFlotante.style.display = 'none';

  // Mostrar el formulario de edición
  const formularioEdicion = document.getElementById('formularioEdicion');
  formularioEdicion.style.display = 'block';

  // Rellenar el formulario con los datos de la propiedad
  document.getElementById('nombreEdicion').value = propiedad.nombre;
  document.getElementById('deptoEdicion').value = propiedad.depto;
  document.getElementById('estEdicion').value = propiedad.estacionamiento;
  document.getElementById('bodegaEdicion').value = propiedad.bodega;

  // Asegurar que ambos formularios estén alineados
  const formularioBusqueda = document.getElementById('formularioBusqueda');
  formularioBusqueda.style.marginTop = '0'; 

  // Cambiar el orden de los formularios (edición encima de búsqueda)
  const main = document.querySelector('.main');
  main.insertBefore(formularioEdicion, main.firstChild);
}

// Restablecer el margen al cerrar el formulario de edición
function cerrarTarjeta() {
  const tarjetaFlotante = document.getElementById('tarjetaFlotante');
  tarjetaFlotante.style.display = 'none';

  // Restablecer la posición del formulario de búsqueda
  const formularioBusqueda = document.getElementById('formularioBusqueda');
  formularioBusqueda.style.marginTop = '0';
}

function actualizarPropiedad() {
  // Obtener los valores actualizados del formulario de edición
  const nombreEdicion = document.getElementById('nombreEdicion').value;
  const deptoEdicion = document.getElementById('deptoEdicion').value;
  const estEdicion = document.getElementById('estEdicion').value;
  const bodegaEdicion = document.getElementById('bodegaEdicion').value;

  // Obtener las propiedades almacenadas
  let propiedades = JSON.parse(localStorage.getItem('propiedades')) || [];

  // Buscar la propiedad que coincide con el depto de edición
  const propiedadAEditar = propiedades.find(propiedad => propiedad.depto === deptoEdicion);

  // Actualizar los valores de la propiedad
  propiedadAEditar.nombre = nombreEdicion;
  propiedadAEditar.estacionamiento = estEdicion;
  propiedadAEditar.bodega = bodegaEdicion;

  // Guardar en localStorage
  localStorage.setItem('propiedades', JSON.stringify(propiedades));

  // Mostrar ventana flotante de edición satisfactoria
  mostrarVentanaFlotante('Edición satisfactoria');

  // Ocultar el formulario de edición
  const formularioEdicion = document.getElementById('formularioEdicion');
  formularioEdicion.style.display = 'none';

  // Limpiar los campos después de la edición
  limpiarCampos();
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


