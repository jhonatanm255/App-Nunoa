

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

  // Obtener la referencia al usuario actual
  const user = firebase.auth().currentUser;
  if (!user) {
    console.error('No hay usuario autenticado');
    return false;
  }
  const userId = user.uid;

  // Obtener el condominio seleccionado
  const condominioSeleccionado = document.getElementById('opciones').value;
  // Obtener la referencia a la colección de propiedades del usuario y condominio seleccionado
  const propiedadesRef = firebase.firestore().collection('users').doc(userId).collection('condominios').doc(condominioSeleccionado).collection('propiedades');

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
    mostrarVentanaFlotante('Registro satisfactorio');
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

  mensajeFlotante.textContent = mensaje;
  ventanaFlotante.style.display = 'block';

  setTimeout(function () {
    ventanaFlotante.style.display = 'none';
  }, 2000);
}

// FUNCION PARA LIMPIAR CAMPOS
function limpiarCampos() {
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

 // Obtener la referencia al usuario actual
 const user = firebase.auth().currentUser;
 if (!user) {
   console.error('No hay usuario autenticado');
   return false;
 }
 const userId = user.uid;

 // Obtener el condominio seleccionado
 const condominioSeleccionado = document.getElementById('opciones').value;
 // Obtener la referencia a la colección de propiedades del usuario y condominio seleccionado
 const propiedadesRef = firebase.firestore().collection('users').doc(userId).collection('condominios').doc(condominioSeleccionado).collection('propiedades');

  // Limpiar el área de resultados antes de mostrar nuevos resultados
  const resultadosContainer = document.getElementById('resultados');
  resultadosContainer.innerHTML = '';

  // Obtener todos los documentos de la colección 'propiedades'
  propiedadesRef.orderBy('depto').get()
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

          listaPropiedades.appendChild(li);
        });

        resultadosContainer.appendChild(listaPropiedades);
        // Ocultar la ventana de editar y borrar
      const btnEditElim = document.querySelector('.btn-edit-elim');
      btnEditElim.style.display = 'none';
      }
    })
    .catch(error => {
      console.error('Error al obtener propiedades:', error);
    });

  // Mostrar la tarjeta flotante
  const tarjetaFlotante = document.getElementById('tarjetaFlotante');
  tarjetaFlotante.style.display = 'block';
}

//FUNCION PARA BUSCAR PROPIEDADES
function buscarPropiedad() {
  // Obtener los valores de los campos de búsqueda y convertirlos a minúsculas
  const nombre = document.getElementById('nombre').value.toLowerCase();
  const depto = document.getElementById('depto').value.toLowerCase();
  const estacionamiento = document.getElementById('est').value.toLowerCase();
  const bodega = document.getElementById('bodega').value.toLowerCase();

   // Obtener la referencia al usuario actual
   const user = firebase.auth().currentUser;
   if (!user) {
     console.error('No hay usuario autenticado');
     return false;
   }
   const userId = user.uid;
 
   // Obtener el condominio seleccionado
   const condominioSeleccionado = document.getElementById('opciones').value;
   // Obtener la referencia a la colección de propiedades del usuario y condominio seleccionado
   const propiedadesRef = firebase.firestore().collection('users').doc(userId).collection('condominios').doc(condominioSeleccionado).collection('propiedades');
 
  // Ejecutar la consulta
  propiedadesRef.get()
    .then(querySnapshot => {
      const resultados = [];
      querySnapshot.forEach(doc => {
        const propiedad = doc.data();
        // Verificar si alguno de los campos de la propiedad coincide con los valores de búsqueda
        if ((nombre === '' || Object.values(propiedad).some(value => typeof value === 'string' && value.toLowerCase().includes(nombre))) &&
            (depto === '' || propiedad.depto.toLowerCase() === depto) &&
            (estacionamiento === '' || propiedad.estacionamiento.toString() === estacionamiento) &&
            (bodega === '' || propiedad.bodega.toString() === bodega)) {
          resultados.push(propiedad);
        }
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

// ELIMINAR REGISTROS
function eliminarPropiedad() {
  const deptoSeleccionado = document.getElementById('depto').value;
  const propiedadesRef = firebase.firestore().collection('propiedades');

  // Buscar y eliminar la propiedad con el depto seleccionado
  propiedadesRef.where('depto', '==', deptoSeleccionado)
    .get()
    .then(querySnapshot => {
      querySnapshot.forEach(doc => {
        doc.ref.delete().then(() => {
          // Mostrar la ventana flotante de eliminación satisfactoria
          mostrarVentanaFlotante('Propiedad eliminada satisfactoriamente');
          limpiarCampos();
          cerrarTarjeta();
        }).catch(error => {
          console.error('Error al eliminar la propiedad:', error);
        });
      });
    })
    .catch(error => {
      console.error('Error al buscar la propiedad a eliminar:', error);
    });
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


//EDITAR REGISTROS
function editarPropiedad() {
  const deptoSeleccionado = document.getElementById('depto').value;
  const propiedadesRef = firebase.firestore().collection('propiedades');

  // Buscar la propiedad con el depto seleccionado
  propiedadesRef.where('depto', '==', deptoSeleccionado)
    .get()
    .then(querySnapshot => {
      querySnapshot.forEach(doc => {
        const propiedadAEditar = doc.data();
        // Obtener la ID de documento
        const idDocumento = doc.id;
        mostrarFormularioEdicion(propiedadAEditar, idDocumento);
      });
    })
    .catch(error => {
      console.error('Error al buscar la propiedad a editar:', error);
    });
}


// Restablecer el margen al cerrar el formulario de edición
function cerrarTarjeta() {
  const tarjetaFlotante = document.getElementById('tarjetaFlotante');
  tarjetaFlotante.style.display = 'none';

  // Restablecer la posición del formulario de búsqueda
  const formularioBusqueda = document.getElementById('formularioBusqueda');
}

//FORMULARIO EDICION
function mostrarFormularioEdicion(propiedad, idDocumento) {
  // Ocultar la tarjeta flotante
  cerrarTarjeta();

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

  // Establecer un atributo de datos en el botón de actualización para almacenar la ID del documento
  const btnActualizar = document.getElementById('btnActualizar');
  btnActualizar.dataset.idDocumento = idDocumento;
}

//ACTUALIZAR PROPIEDAD
function actualizarPropiedad() {
  // Obtener la ID del documento desde el botón de actualización
  const idDocumento = document.getElementById('btnActualizar').dataset.idDocumento;

  // Obtener los valores actualizados del formulario de edición
  const nombreEdicion = document.getElementById('nombreEdicion').value;
  const nombreEdicion2 = document.getElementById('nombreEdicion2').value;
  const nombreEdicion3 = document.getElementById('nombreEdicion3').value;
  const nombreEdicion4 = document.getElementById('nombreEdicion4').value;
  const deptoEdicion = document.getElementById('deptoEdicion').value;
  const estEdicion = document.getElementById('estEdicion').value;
  const bodegaEdicion = document.getElementById('bodegaEdicion').value;

  // Obtener una referencia al documento en Firestore que se va a actualizar
  const propiedadRef = firebase.firestore().collection('propiedades').doc(idDocumento);

  // Actualizar los valores de la propiedad
  propiedadRef.update({
    nombre: nombreEdicion,
    nombre2: nombreEdicion2,
    nombre3: nombreEdicion3,
    nombre4: nombreEdicion4,
    estacionamiento: parseInt(estEdicion),
    bodega: parseInt(bodegaEdicion)
  })
    .then(() => {
      // Mostrar ventana flotante de edición satisfactoria
      mostrarVentanaFlotante('Edición satisfactoria');

      // Ocultar el formulario de edición
      const formularioEdicion = document.getElementById('formularioEdicion');
      formularioEdicion.style.display = 'none';

      // Limpiar los campos después de la edición
      limpiarCampos();
    })
    .catch(error => {
      console.error('Error al actualizar propiedad:', error);
      // Mostrar ventana flotante de error
      mostrarVentanaFlotante('Error al actualizar propiedad');
    });
}

