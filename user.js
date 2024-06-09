
  
function iniciarSesion() {
    const usuario = document.getElementById('usuario').value;
    const clave = document.getElementById('clave').value;
  
    // Iniciar sesión con Firebase
    firebase.auth().signInWithEmailAndPassword(usuario, clave)
      .then((userCredential) => {
        // Inicio de sesión exitoso
        const user = userCredential.user;
        console.log("Usuario autenticado:", user);
        // Redirigir al usuario a otra página o realizar otras acciones necesarias
              window.location.href = "main.html";

      })
      .catch((error) => {
        // Error en el inicio de sesión
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Error en el inicio de sesión:", errorMessage);
      });
  }
//   FUNCION PARA MOSTRAR EL NOMBRE DE USUARIO EN LA SESION ACTUAL
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      // El usuario está autenticado
      const nombreUsuario = user.displayName;
      const userPhotoURL = user.photoURL;

      if (nombreUsuario) {
        document.getElementById('nombreUsuario').textContent = ` ${nombreUsuario}`;
        // Mostrar la foto del usuario si está disponible
        if (userPhotoURL) {
          document.getElementById('user-photo').src = userPhotoURL;
        } else {
          // Si no hay foto disponible, puedes mostrar una foto por defecto o dejar el campo vacío
          document.getElementById('user-photo').src = 'default-user-photo.jpg';
        }
      }
    } else {
      // El usuario no está autenticado
      // Redirigir al usuario al formulario de inicio de sesión o a otra página
      
    }
  });

//   FUNCION PARA CERRAR SESION
function cerrarSesion() {
    firebase.auth().signOut().then(() => {
        // Sign-out exitoso, redirigir a index.html
        window.location.href = "index.html";
    }).catch((error) => {
        // Error al cerrar sesión
        console.error("Error al cerrar sesión:", error);
    });
}

  
  
  // Registrar nuevo usuario con correo electrónico/password
  function registrarUsuario(email, password) {
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // Usuario registrado exitosamente
        const user = userCredential.user;
        console.log("Usuario registrado:", user);
      })
      .catch((error) => {
        // Error en el registro
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Error en el registro:", errorMessage);
      });
  }


  
  // Iniciar sesión con Google
function iniciarSesionConGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
  
    firebase.auth().signInWithPopup(provider)
      .then((result) => {
        // Inicio de sesión exitoso, puedes redirigir a otra página
        const user = result.user;
        console.log("Usuario autenticado:", user);
        window.location.href = "main.html"; // Redirigir al usuario a la página principal
      })
      .catch((error) => {
        // Error en el inicio de sesión con Google
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Error en el inicio de sesión con Google:", errorMessage);
      });
}

  
  