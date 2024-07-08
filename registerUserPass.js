const auth = firebase.auth();

const btnRegistro = document.getElementById('registrar');
btnRegistro.addEventListener('click', () => {
    const formularioRegistro = document.getElementById('registroForm');
    formularioRegistro.style.display = 'block';
});

document.addEventListener('DOMContentLoaded', (event) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        document.getElementById('nombreUsuario').textContent = user.displayName;
        document.getElementById('user-photo').src = user.photoURL;
    } else {
        console.error('No user data found in localStorage');
    }
});

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', (event) => {
    const registroForm = document.getElementById('registroForm');

    if (registroForm) {
        registroForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const nombre = document.getElementById('nombre').value;
            const apellido = document.getElementById('apellido').value;
            const archivoFoto = document.getElementById('foto').files[0];

            registrarUsuario(email, password, nombre, apellido, archivoFoto);
        });
    } else {
        console.error("Formulario de registro no encontrado.");
    }
});

// Función para registrar un usuario
function registrarUsuario(email, password, nombre, apellido, archivoFoto) {
    console.log("Intentando registrar usuario con email:", email);

    firebase.auth().fetchSignInMethodsForEmail(email)
        .then((signInMethods) => {
            console.log("Métodos de inicio de sesión para el email:", signInMethods);
            if (signInMethods.length > 0) {
                // El correo electrónico ya está en uso
                throw new Error('auth/email-already-in-use');
            } else {
                // El correo electrónico no está en uso, proceder con el registro
                return firebase.auth().createUserWithEmailAndPassword(email, password);
            }
        })
        .then((userCredential) => {
            if (!userCredential) {
                return; // Si ya se lanzó un error, no continuar
            }
            const user = userCredential.user;
            console.log("Usuario registrado:", user);

            // Subir la foto de perfil a Firebase Storage
            const storageRef = firebase.storage().ref();
            const photoRef = storageRef.child('fotos_perfil/' + user.uid + '.jpg');
            return photoRef.put(archivoFoto)
                .then(() => photoRef.getDownloadURL())
                .then((photoURL) => {
                    // Actualizar el perfil del usuario
                    return user.updateProfile({
                        displayName: `${nombre} ${apellido}`,
                        photoURL: photoURL
                    }).then(() => {
                        // Guardar información del usuario en Firestore
                        return firestore.collection('usuarios').doc(user.uid).set({
                            email: user.email,
                            displayName: `${nombre} ${apellido}`,
                            photoURL: photoURL,
                            nombre: nombre,
                            apellido: apellido,
                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
                        }).then(() => {
                            // Guardar datos del usuario en localStorage
                            localStorage.setItem('user', JSON.stringify({
                                uid: user.uid,
                                displayName: user.displayName,
                                email: user.email,
                                photoURL: user.photoURL
                            }));

                            // Cerrar el formulario de registro
                            const formularioRegistro = document.getElementById('registroForm');
                            formularioRegistro.style.display = 'none';

                            // Redireccionar al usuario
                            window.location.href = "main.html";
                        });
                    });
                });
        })
        .catch((error) => {
            const errorMessage = document.getElementById('error-message');
            if (errorMessage) {
                if (error.message === 'auth/email-already-in-use') {
                    errorMessage.textContent = 'El correo electrónico ya está en uso. Por favor, usa otro correo electrónico.';
                } else {
                    errorMessage.textContent = `Error en el registro: ${error.message}`;
                }
            }
            console.error("Error en el registro:", error);
        });
}

// Función para iniciar sesión
function iniciarSesion() {
    const email = document.getElementById('usuario').value;
    const password = document.getElementById('clave').value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Iniciar sesión exitosa
            const user = userCredential.user;
            console.log("Usuario inició sesión:", user);

            // Guardar datos del usuario en localStorage
            localStorage.setItem('user', JSON.stringify({
                uid: user.uid,
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL
            }));

            window.location.href = "main.html";
        })
        .catch((error) => {
            const errorMessage = document.getElementById('error-message');
            if (errorMessage) {
                errorMessage.textContent = `Error en el inicio de sesión: ${error.message}`;
            }
            console.error("Error en el inicio de sesión:", error);
        });
}
