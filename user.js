
// Configuración de Firebase
const firestore = firebase.firestore();

// Función para iniciar sesión con Google
function iniciarSesionConGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();

  firebase.auth().signInWithPopup(provider)
    .then((result) => {
      const user = result.user;
      console.log("Usuario autenticado:", user);

      // Verificar si el usuario ya está en Firestore
      const userRef = firestore.collection('usuarios').doc(user.uid);
      return userRef.get().then((doc) => {
        if (!doc.exists) {
          return userRef.set({
            email: user.email,
            displayName: user.displayName || "",
            photoURL: user.photoURL || "",
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        } else {
          return userRef.update({
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
          });
        }
      });
    })
    .then(() => {
      window.location.href = "main.html";
    })
    .catch((error) => {
      console.error("Error en el inicio de sesión con Google:", error.message);
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
  }
});
