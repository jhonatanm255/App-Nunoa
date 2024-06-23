// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.getElementById('agregar-edif').addEventListener('click', function() {
  const nombreCondominio = prompt('Por favor, ingresa el nombre del condominio:');
  if (nombreCondominio) {
      const listaCondominios = document.getElementById('opciones');
      const nuevoElemento = document.createElement('option');
      nuevoElemento.textContent = nombreCondominio;
      listaCondominios.appendChild(nuevoElemento);

      // Obtener el usuario actual
      const user = firebase.auth().currentUser;
      if (user) {
          const userId = user.uid;
          // Agregar condominio seleccionado a Firestore
          db.collection('users').doc(userId).collection('condominios').add({
              name: nombreCondominio
          })
          .then(() => {
              console.log('Condominio agregado correctamente');
              displayCondominiums(userId);
          })
          .catch((error) => {
              console.error('Error agregando condominio: ', error);
          });
      } else {
          console.log('No hay usuario autenticado');
          // Aquí podrías mostrar un mensaje o redireccionar a la página de inicio de sesión
      }
  } else {
      swal('Rellena este campo.', "" , "warning");
  }
});

// Obtener los condominios asociados al usuario y mostrarlos en la lista
function displayCondominiums(userId) {
  const listaCondominios = document.getElementById('opciones');
  listaCondominios.innerHTML = ''; // Limpiar la lista antes de mostrar los condominios

  // Obtener condominios asignados al usuario desde Firestore
  db.collection('users').doc(userId).collection('condominios').get()
  .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
          const condominio = doc.data();
          const opcion = document.createElement('option');
          opcion.textContent = condominio.name;
          listaCondominios.appendChild(opcion);
      });
  })
  .catch((error) => {
      console.error('Error obteniendo condominios: ', error);
  });
}
// FUNCION PARA MANTENER LA SELECCION DEL CONDOMINIO AL RECARGAR LA APP
  
// Escuchar cambios en el estado de autenticación
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
      // El usuario está autenticado
      const userId = user.uid;
      console.log('Usuario actual:', user.email);
      displayCondominiums(userId);
  } else {
      // No hay usuario autenticado, redireccionar a la página de inicio de sesión
      console.log('No hay usuario autenticado');
      // Aquí podrías redireccionar a la página de inicio de sesión
  }
});

// MODAL Y FUNCION

// Obtener el icono y el modal
const iconoCondominio = document.querySelector('.menu-condominios .icon');
const modal = document.getElementById('myModal');
const spanClose = document.querySelector('.close');

// Cuando se hace clic en el icono, mostrar el modal
iconoCondominio.addEventListener('click', () => {
  // Obtener el nombre del condominio seleccionado
  const nombreCondominioSeleccionado = document.querySelector('#opciones').value;

  // Aquí puedes obtener más detalles del condominio desde tu base de datos o donde los tengas almacenados
  
  // Mostrar el nombre del condominio en el modal
  document.getElementById('condominioNombre').textContent = nombreCondominioSeleccionado;

  // Mostrar el modal
  modal.style.display = 'block';
});

// Cuando se hace clic en el botón de cerrar (X), cerrar el modal
spanClose.addEventListener('click', () => {
  modal.style.display = 'none';
});

// Cuando el usuario hace clic fuera del modal, cerrar el modal
window.addEventListener('click', (event) => {
  if (event.target === modal) {
    modal.style.display = 'none';
  }
});
