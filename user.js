// // Configuración de Firebase
// const firestore = firebase.firestore();

// // Función para iniciar sesión con Google
// function iniciarSesionConGoogle() {
//   const provider = new firebase.auth.GoogleAuthProvider();

//   firebase.auth().signInWithPopup(provider)
//     .then((result) => {
//       // Cerrar indicador de carga cuando la autenticación sea exitosa
//       Swal.close();

//       const user = result.user;
//       console.log("Usuario autenticado:", user);

//        // Mostrar indicador de carga
//       Swal.fire({
//         title: 'Iniciando sesión con Google',
//         text: 'Por favor, espera mientras iniciamos sesión...',
//         allowOutsideClick: false,
//         didOpen: () => {
//           Swal.showLoading();
//         }
//       });

//       // Verificar si el usuario ya está en Firestore
//       const userRef = firestore.collection('usuarios').doc(user.uid);
//       return userRef.get().then((doc) => {
//         if (!doc.exists) {
//           return userRef.set({
//             email: user.email,
//             displayName: user.displayName || "",
//             photoURL: user.photoURL || "",
//             createdAt: firebase.firestore.FieldValue.serverTimestamp()
//           });
//         } else {
//           return userRef.update({
//             lastLogin: firebase.firestore.FieldValue.serverTimestamp()
//           });
//         }
//       });
//     })
//     .then(() => {
//       window.location.href = "main.html";
//     })
//     .catch((error) => {
//       // Cerrar indicador de carga en caso de error
//       Swal.close();
//       console.error("Error en el inicio de sesión con Google:", error.message);
      
//       // Mostrar mensaje de error
//       Swal.fire({
//         title: 'Error en el inicio de sesión con Google',
//         text: 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.',
//         icon: 'error',
//       });
//     });
// }

// // Función para cerrar sesión
// function cerrarSesion() {
//   firebase.auth().signOut().then(() => {
//     window.location.href = "index.html";
//   }).catch((error) => {
//     console.error("Error al cerrar sesión:", error);
//   });
// }

// // Mostrar el nombre y la foto del usuario en la sesión actual
// firebase.auth().onAuthStateChanged((user) => {
//   if (user) {
//     const nombreUsuario = user.displayName;
//     const userPhotoURL = user.photoURL;

//     if (nombreUsuario) {
//       document.getElementById('nombreUsuario').textContent = ` ${nombreUsuario}`;
//       if (userPhotoURL) {
//         document.getElementById('user-photo').src = userPhotoURL;
//       } else {
//         document.getElementById('user-photo').src = 'default-user-photo.jpg';
//       }
//     }
//   }
// });



// Configuración de Firebase
const firestore = firebase.firestore();

// Configurar la persistencia de la sesión en local
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  .then(() => {
    console.log("Persistencia configurada en local");
  })
  .catch((error) => {
    console.error("Error al establecer la persistencia:", error);
  });

// Función para iniciar sesión con Google
function iniciarSesionConGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();

  // Mostrar indicador de carga antes de iniciar sesión
  Swal.fire({
    title: 'Iniciando sesión con Google',
    text: 'Por favor, espera mientras iniciamos sesión...',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  firebase.auth().signInWithPopup(provider)
    .then((result) => {
      // Cerrar indicador de carga cuando la autenticación sea exitosa
      Swal.close();

      const user = result.user;
      console.log("Usuario autenticado:", user);

      // Verificar si el usuario ya está en Firestore
      const userRef = firestore.collection('usuarios').doc(user.uid);
      return userRef.get().then((doc) => {
        if (!doc.exists) {
          // Si el usuario no existe, crear uno nuevo en Firestore
          return userRef.set({
            email: user.email,
            displayName: user.displayName || "",
            photoURL: user.photoURL || "",
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        } else {
          // Si el usuario ya existe, actualizar el último inicio de sesión
          return userRef.update({
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
          });
        }
      });
    })
    .then(() => {
      // Redirigir al usuario a la página principal
      window.location.href = "main.html";
    })
    .catch((error) => {
      // Cerrar indicador de carga en caso de error
      Swal.close();
      console.error("Error en el inicio de sesión con Google:", error.message);
      
      // Mostrar mensaje de error
      Swal.fire({
        title: 'Error en el inicio de sesión con Google',
        text: 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.',
        icon: 'error',
      });
    });
}

// Función para cerrar sesión
function cerrarSesion() {
  firebase.auth().signOut().then(() => {
    window.location.href = "index.html";
  }).catch((error) => {
    console.error("Error al cerrar sesión:", error);
  });
}

// Mostrar el nombre y la foto del usuario en la sesión actual
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    const nombreUsuario = user.displayName;
    const userPhotoURL = user.photoURL;

    if (nombreUsuario) {
      document.getElementById('nombreUsuario').textContent = ` ${nombreUsuario}`;
      if (userPhotoURL) {
        document.getElementById('user-photo').src = userPhotoURL;
      } else {
        document.getElementById('user-photo').src = 'default-user-photo.jpg';
      }
    }
  } else {
    // Si no hay un usuario autenticado, redirigir al login (opcional)
    console.log("No hay usuario autenticado");
  }
});
