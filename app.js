

//CREAR REGISTRO NUEVO

function crearPropiedad() {
  const nombre = document.getElementById('nombre').value;
  const nombre2 = document.getElementById('nombre2').value;
  const nombre3 = document.getElementById('nombre3').value;
  const nombre4 = document.getElementById('nombre4').value;
  const depto = document.getElementById('depto').value;
  const estacionamiento = document.getElementById('est').value;
  const bodega = document.getElementById('bodega').value;

  if ((nombre === '' && nombre2 === '' && nombre3 === '' && nombre4 === '') || depto === '' || estacionamiento === '' || bodega === '') {
    alert('Complete todos los campos');
    return false;
  }

  // Obtener la referencia a la colección 'propiedades' en Firestore
  const propiedadesRef = firebase.firestore().collection('propiedades');
 

  // Agregar la nueva propiedad a Firestore
  propiedadesRef.add({
    nombre: nombre,
    nombre2: nombre2,
    nombre3: nombre3,
    nombre4: nombre4,
    depto: depto,
    estacionamiento: estacionamiento,
    bodega: bodega
  })
  .then(() => {
    // Mostrar la ventana flotante
    mostrarVentanaFlotante('Registro satisfactorio');

    // Limpiar los campos después de agregar el registro
    limpiarCampos();
  })
  .catch(error => {
    console.error('Error al agregar la propiedad:', error);
  });

  return true;
}


//BOTON DE SLIDE PARA LOS INPUTS RESTANTES
const btnSlide = document.getElementById('slide');
const inputOculto = document.querySelector('.inputs-ocultos');

btnSlide.addEventListener('click', (e) => {
  e.preventDefault();
    if(inputOculto.style.display === 'none'){
      inputOculto.style.transition = '1s'
      inputOculto.style.display = 'block'
      
    }else{
      inputOculto.style.display = 'none'
    }
})

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

// FUNCION PARA LIMPIAR CAMPOS
function limpiarCampos() {
  // Limpiar los campos después de agregar el registro
  document.getElementById('nombre').value = '';
  document.getElementById('nombre2').value = '';
  document.getElementById('nombre3').value = '';
  document.getElementById('nombre4').value = '';
  document.getElementById('depto').value = '';
  document.getElementById('est').value = '';
  document.getElementById('bodega').value = '';
}
limpiarCampos()

// FUNCION PARA LEER LAS PROPIEDADES
function leerPropiedades() {
  // Obtener la referencia a la colección 'propiedades' en Firestore
  const propiedadesRef = firebase.firestore().collection('propiedades');

  // Limpiar el área de resultados antes de mostrar nuevos resultados
  const resultadosContainer = document.getElementById('resultados');
  resultadosContainer.innerHTML = '';

  // Obtener todos los documentos de la colección 'propiedades'
  propiedadesRef.get()
    .then(querySnapshot => {
      if (querySnapshot.empty) {
        // Mostrar mensaje si no hay propiedades almacenadas
        resultadosContainer.textContent = 'No hay propiedades almacenadas.';
      } else {
        // Crear una lista para almacenar las propiedades
        const listaPropiedades = document.createElement('ul');
        listaPropiedades.classList.add('resultados-lista');

        // Iterar sobre los documentos y agregar cada propiedad a la lista
        querySnapshot.forEach(doc => {
          const propiedad = doc.data();
          const li = document.createElement('li');

          const contenidoPropiedad = `
            <p><b>Nombre:</b> ${propiedad.nombre}</p>
            <p><b>Nombre:</b> ${propiedad.nombre2}</p>
            <p><b>Nombre:</b> ${propiedad.nombre3}</p>
            <p><b>Nombre:</b> ${propiedad.nombre4}</p>
            <p><b>Depto:</b> ${propiedad.depto}</p>
            <p><b>Estacionamiento:</b> ${propiedad.estacionamiento}</p>
            <p><b>Bodega:</b> ${propiedad.bodega}</p>
          `;

          li.innerHTML = contenidoPropiedad;
          li.style.marginBottom = '15px';
          li.style.backgroundColor = 'rgb(220, 220, 220)';
          li.style.borderRadius = '5px';
          li.style.padding = '10px';

          // Agregar el elemento li a la lista
          listaPropiedades.appendChild(li);
        });

        // Agregar la lista al contenedor de resultados
        resultadosContainer.appendChild(listaPropiedades);
      }
    })
    .catch(error => {
      console.error('Error al obtener propiedades:', error);
    });

  // Mostrar la tarjeta flotante
  const tarjetaFlotante = document.getElementById('tarjetaFlotante');
  tarjetaFlotante.style.display = 'block';
}


//BUSCAR REGISTROS
function buscarPropiedad() {
  // Obtener los valores de búsqueda
  const nombre = document.getElementById('nombre').value.toLowerCase();
  const nombre2 = document.getElementById('nombre2').value.toLowerCase();
  const nombre3 = document.getElementById('nombre3').value.toLowerCase();
  const nombre4 = document.getElementById('nombre4').value.toLowerCase();
  const depto = document.getElementById('depto').value.toLowerCase();
  const estacionamiento = document.getElementById('est').value.toLowerCase();
  const bodega = document.getElementById('bodega').value.toLowerCase();

  // Obtener la referencia a la colección 'propiedades' en Firestore
  const propiedadesRef = firebase.firestore().collection('propiedades');

  // Construir la consulta
  let query = propiedadesRef;
  if (nombre !== '') {
    query = query.where('nombre', '==', nombre);
  }
  if (nombre2 !== '') {
    query = query.where('nombre2', '==', nombre2);
  }
  if (nombre3 !== '') {
    query = query.where('nombre3', '==', nombre3);
  }
  if (nombre4 !== '') {
    query = query.where('nombre4', '==', nombre4);
  }
  if (depto !== '') {
    query = query.where('depto', '==', depto);
  }
  if (estacionamiento !== '') {
    query = query.where('estacionamiento', '==', parseInt(estacionamiento)); // Convertir a número
  }
  if (bodega !== '') {
    query = query.where('bodega', '==', parseInt(bodega)); // Convertir a número
  }

  // Ejecutar la consulta
  query.get()
    .then(querySnapshot => {
      const resultados = [];
      querySnapshot.forEach(doc => {
        resultados.push(doc.data());
      });
      mostrarResultados(resultados);
    })
    .catch(error => {
      console.error('Error al buscar propiedades:', error);
    });
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
              <p><b>Nombre:</b> ${resultado.nombre2}</p><br>
              <p><b>Nombre:</b> ${resultado.nombre3}</p><br>
              <p><b>Nombre:</b> ${resultado.nombre4}</p><br>
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
  document.getElementById('nombreEdicion2').value = propiedad.nombre2;
  document.getElementById('nombreEdicion3').value = propiedad.nombre3;
  document.getElementById('nombreEdicion4').value = propiedad.nombre4;
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
}

function actualizarPropiedad() {
  // Obtener los valores actualizados del formulario de edición
  const nombreEdicion = document.getElementById('nombreEdicion').value;
  const nombreEdicion2 = document.getElementById('nombreEdicion2').value;
  const nombreEdicion3 = document.getElementById('nombreEdicion3').value;
  const nombreEdicion4 = document.getElementById('nombreEdicion4').value;
  const deptoEdicion = document.getElementById('deptoEdicion').value;
  const estEdicion = document.getElementById('estEdicion').value;
  const bodegaEdicion = document.getElementById('bodegaEdicion').value;

  // Obtener las propiedades almacenadas
  let propiedades = JSON.parse(localStorage.getItem('propiedades')) || [];

  // Buscar la propiedad que coincide con el depto de edición
  const propiedadAEditar = propiedades.find(propiedad => propiedad.depto === deptoEdicion);

  // Actualizar los valores de la propiedad
  propiedadAEditar.nombre = nombreEdicion;
  propiedadAEditar.nombre2 = nombreEdicion2;
  propiedadAEditar.nombre3 = nombreEdicion3;
  propiedadAEditar.nombre4 = nombreEdicion4;
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


