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
    swal('Complete todos los campos', "", "error");
    return false;
  }

  const user = firebase.auth().currentUser;
  if (!user) {
    console.error('No hay usuario autenticado');
    return false;
  }
  const userId = user.uid;
  const condominioSeleccionado = document.getElementById('opciones').value;
  const propiedadesRef = firebase.firestore().collection('users').doc(userId).collection('condominios').doc(condominioSeleccionado).collection('propiedades');

  // Comprobar si ya existe el depto
  propiedadesRef.where('depto', '==', depto).get()
    .then(querySnapshot => {
      if (!querySnapshot.empty) {
        swal('El registro ya existe', "", "warning");
        return false;
      } else {
        // Si no existe, agregar la nueva propiedad
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
      }
    })
    .catch(error => {
      console.error('Error al comprobar el depto:', error);
    });

  return true;
}

//BOTON DE SLIDE PARA LOS INPUTS RESTANTES
const btnSlide = document.getElementById('slide');
const inputOculto = document.querySelector('.inputs-ocultos');

btnSlide.addEventListener('click', (e) => {
  e.preventDefault();
  inputOculto.style.display = inputOculto.style.display === 'none' ? 'block' : 'none';
});

//FUNCION PARA MOSTRAR VENTANA FLOTANTE
function mostrarVentanaFlotante(mensaje) {
  const ventanaFlotante = document.getElementById('ventanaFlotante');
  const mensajeFlotante = document.getElementById('mensajeFlotante');

  mensajeFlotante.textContent = mensaje;
  ventanaFlotante.style.display = 'block';

  setTimeout(() => {
    ventanaFlotante.style.display = 'none';
  }, 2000);
}

//FUNCION PARA LIMPIAR CAMPOS
function limpiarCampos() {
  document.querySelectorAll('input').forEach(input => input.value = '');
}

//FUNCION PARA LEER LAS PROPIEDADES
function leerPropiedades() {
  const user = firebase.auth().currentUser;
  if (!user) {
    console.error('No hay usuario autenticado');
    return false;
  }
  const userId = user.uid;
  const condominioSeleccionado = document.getElementById('opciones').value;
  const propiedadesRef = firebase.firestore().collection('users').doc(userId).collection('condominios').doc(condominioSeleccionado).collection('propiedades');

  const resultadosContainer = document.getElementById('resultados');
  resultadosContainer.innerHTML = '';

  propiedadesRef.orderBy('depto').get()
    .then(querySnapshot => {
      if (querySnapshot.empty) {
        resultadosContainer.textContent = 'No hay propiedades almacenadas.';
      } else {
        const listaPropiedades = document.createElement('ul');
        listaPropiedades.classList.add('resultados-lista');

        querySnapshot.forEach(doc => {
          const propiedad = doc.data();
          const li = document.createElement('li');
          li.innerHTML = `
            <p><b>Nombre:</b> ${propiedad.nombre}</p>
            <p><b>Nombre:</b> ${propiedad.nombre2}</p>
            <p><b>Nombre:</b> ${propiedad.nombre3}</p>
            <p><b>Nombre:</b> ${propiedad.nombre4}</p>
            <p><b>Depto:</b> ${propiedad.depto}</p>
            <p><b>Estacionamiento:</b> ${propiedad.estacionamiento}</p>
            <p><b>Bodega:</b> ${propiedad.bodega}</p>
          `;
          li.style.cssText = 'margin-bottom: 15px; background-color: rgb(220, 220, 220); border-radius: 5px; padding: 10px;';
          listaPropiedades.appendChild(li);
        });

        resultadosContainer.appendChild(listaPropiedades);
      }
    })
    .catch(error => {
      console.error('Error al obtener propiedades:', error);
    });

  document.getElementById('tarjetaFlotante').style.display = 'block';
}

//FUNCION PARA BUSCAR PROPIEDADES
function buscarPropiedad() {
  const nombre = document.getElementById('nombre').value.toLowerCase();
  const depto = document.getElementById('depto').value.toLowerCase();
  const estacionamiento = document.getElementById('est').value.toLowerCase();
  const bodega = document.getElementById('bodega').value.toLowerCase();

  const user = firebase.auth().currentUser;
  if (!user) {
    console.error('No hay usuario autenticado');
    return false;
  }
  const userId = user.uid;
  const condominioSeleccionado = document.getElementById('opciones').value;
  const propiedadesRef = firebase.firestore().collection('users').doc(userId).collection('condominios').doc(condominioSeleccionado).collection('propiedades');

  propiedadesRef.get()
    .then(querySnapshot => {
      const resultados = [];
      querySnapshot.forEach(doc => {
        const propiedad = doc.data();
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
    resultados.forEach(resultado => {
      const tarjeta = document.createElement('div');
      tarjeta.classList.add('tarjeta');
      tarjeta.innerHTML = `
        <p><b>Nombre:</b> ${resultado.nombre}</p>
        <p><b>Nombre:</b> ${resultado.nombre2}</p>
        <p><b>Nombre:</b> ${resultado.nombre3}</p>
        <p><b>Nombre:</b> ${resultado.nombre4}</p>
        <p><b>Depto:</b> ${resultado.depto}</p>
        <p><b>Estacionamiento:</b> ${resultado.estacionamiento}</p>
        <p><b>Bodega:</b> ${resultado.bodega}</p>
      `;
      resultadosDiv.appendChild(tarjeta);
    });
    tarjetaFlotante.style.display = 'block';
    document.querySelector('.btn-edit-elim').style.display = 'flex';
  } else {
    resultadosDiv.textContent = 'No se encontraron registros asociados';
    tarjetaFlotante.style.display = 'block';
    document.querySelector('.btn-edit-elim').style.display = 'none';
  }
}

//FUNCION PARA REFRESCAR APP
function refrescarPagina() {
  location.reload();
}

// FUNCION PARA EDITAR PROPIEDAD
const btnEditar = document.getElementById('edit');
btnEditar.addEventListener('click', () => {
  document.getElementById('formularioEdicion').style.display = 'block';
});

function mostrarResultados(resultados) {
  const resultadosDiv = document.getElementById('resultados');
  const tarjetaFlotante = document.getElementById('tarjetaFlotante');

  resultadosDiv.innerHTML = '';

  if (resultados.length > 0) {
    resultados.forEach(resultado => {
      const tarjeta = document.createElement('div');
      tarjeta.classList.add('tarjeta');
      tarjeta.innerHTML = `
        <p><b>Nombre:</b> ${resultado.nombre}</p>
        <p><b>Nombre:</b> ${resultado.nombre2}</p>
        <p><b>Nombre:</b> ${resultado.nombre3}</p>
        <p><b>Nombre:</b> ${resultado.nombre4}</p>
        <p><b>Depto:</b> ${resultado.depto}</p>
        <p><b>Estacionamiento:</b> ${resultado.estacionamiento}</p>
        <p><b>Bodega:</b> ${resultado.bodega}</p>
        <div class="button-group">
        <button id="edit" class="edit" onclick="editarPropiedad('${resultado.depto}', '${resultado.nombre}', '${resultado.nombre2}', '${resultado.nombre3}', '${resultado.nombre4}', '${resultado.estacionamiento}', '${resultado.bodega}')">Editar</button>
        <button id="elim" class="elim" onclick="eliminarPropiedad('${resultado.depto}', '${resultado.nombre}', '${resultado.nombre2}', '${resultado.nombre3}', '${resultado.nombre4}', '${resultado.estacionamiento}', '${resultado.bodega}')">Borrar</button>
      </div>
      `;
      resultadosDiv.appendChild(tarjeta);
    });
    tarjetaFlotante.style.display = 'block';
  } else {
    resultadosDiv.textContent = 'No se encontraron registros asociados';
    tarjetaFlotante.style.display = 'block';
    document.querySelector('.btn-edit-elim').style.display = 'none';
  }
}

function editarPropiedad(depto, nombre, nombre2, nombre3, nombre4, estacionamiento, bodega) {
  tarjetaFlotante.style.display = 'none';
  document.getElementById('formularioEdicion').style.display = 'block';
  document.getElementById('nombreEdicion').value = nombre;
  document.getElementById('nombreEdicion2').value = nombre2;
  document.getElementById('nombreEdicion3').value = nombre3;
  document.getElementById('nombreEdicion4').value = nombre4;
  document.getElementById('deptoEdicion').value = depto;
  document.getElementById('estEdicion').value = estacionamiento;
  document.getElementById('bodegaEdicion').value = bodega;

  // Guarda el depto actual para la actualización
  document.getElementById('deptoActual').value = depto;
}

function actualizarPropiedad() {
  const nombreEdicion = document.getElementById('nombreEdicion').value;
  const nombreEdicion2 = document.getElementById('nombreEdicion2').value;
  const nombreEdicion3 = document.getElementById('nombreEdicion3').value;
  const nombreEdicion4 = document.getElementById('nombreEdicion4').value;
  const deptoEdicion = document.getElementById('deptoEdicion').value;
  const estEdicion = document.getElementById('estEdicion').value;
  const bodegaEdicion = document.getElementById('bodegaEdicion').value;
  const deptoActual = document.getElementById('deptoActual').value;

  const user = firebase.auth().currentUser;
  if (!user) {
    console.error('No hay usuario autenticado');
    return false;
  }
  const userId = user.uid;
  const condominioSeleccionado = document.getElementById('opciones').value;
  const propiedadesRef = firebase.firestore().collection('users').doc(userId).collection('condominios').doc(condominioSeleccionado).collection('propiedades');

  propiedadesRef.where('depto', '==', deptoActual).get()
    .then(querySnapshot => {
      querySnapshot.forEach(doc => {
        doc.ref.update({
          nombre: nombreEdicion,
          nombre2: nombreEdicion2,
          nombre3: nombreEdicion3,
          nombre4: nombreEdicion4,
          depto: deptoEdicion,
          estacionamiento: estEdicion,
          bodega: bodegaEdicion
        })
        .then(() => {
          mostrarVentanaFlotante('Propiedad actualizada satisfactoriamente');
          document.getElementById('formularioEdicion').style.display = 'none';
          limpiarCampos();
          cerrarTarjeta();
          leerPropiedades();
        })
        .catch(error => {
          console.error('Error al actualizar la propiedad:', error);
        });
      });
    })
    .catch(error => {
      console.error('Error al buscar propiedades:', error);
    });

  return true;
}

//ELIMINAR REGISTROS
function eliminarPropiedad() {
  const deptoSeleccionado = document.getElementById('depto').value;

  const user = firebase.auth().currentUser;
  if (!user) {
    console.error('No hay usuario autenticado');
    return false;
  }
  const userId = user.uid;
  const condominioSeleccionado = document.getElementById('opciones').value;
  const propiedadesRef = firebase.firestore().collection('users').doc(userId).collection('condominios').doc(condominioSeleccionado).collection('propiedades');

  propiedadesRef.where('depto', '==', deptoSeleccionado)
    .get()
    .then(querySnapshot => {
      querySnapshot.forEach(doc => {
        doc.ref.delete().then(() => {
          mostrarVentanaFlotante('Propiedad eliminada satisfactoriamente');
          limpiarCampos();
          cerrarTarjeta();
        }).catch(error => {
          console.error('Error al eliminar la propiedad:', error);
        });
      });
    })
    .catch(error => {
      console.error('Error al buscar propiedades:', error);
    });

  return true;
}

//FUNCION PARA CERRAR LA TARJETA FLOTANTE
function cerrarTarjeta() {
  document.getElementById('tarjetaFlotante').style.display = 'none';
}