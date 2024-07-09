const auth = firebase.auth();

const btnRegistro = document.getElementById('registrar');
btnRegistro.addEventListener('click', () => {
    const formularioRegistro = document.getElementById('registroForm');
    formularioRegistro.style.display = 'block';

    const btnClose = document.getElementById('cerrarFormulario');
    btnClose.addEventListener('click', () => {
        formularioRegistro.style.display = 'none';
    });
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

    // Validar campos llenos y formato
    if (!email || !password || !nombre || !apellido) {
        Swal.fire({
            title: 'Campos vacíos',
            text: 'Por favor, completa todos los campos.',
            icon: 'warning',
        });
        return;
    }

    // Validar formato de correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        Swal.fire({
            title: 'Correo electrónico inválido',
            text: 'Por favor, ingresa un correo electrónico válido.',
            icon: 'warning',
        });
        return;
    }

    // Validar formato de contraseña
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{6,}$/;
    if (!passwordRegex.test(password)) {
        Swal.fire({
            title: 'Contraseña insegura',
            text: 'La contraseña debe tener al menos 6 caracteres, incluyendo letras, números y al menos un carácter especial.',
            icon: 'warning',
        });
        return;
    }

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

                            // Enviar correo de verificación
                            return user.sendEmailVerification();
                        }).then(() => {
                            console.log("Correo de verificación enviado a", user.email);
                        });
                    });
                });
        })
        .then(() => {
            console.log("Información del usuario guardada en Firestore.");
            const formularioRegistro = document.getElementById('registroForm');
            formularioRegistro.style.display = 'none';
            Swal.fire('Registro exitoso', 'Por favor, verifica tu correo electrónico antes de iniciar sesión.', 'success').then(() => {
                window.location.href = "index.html";
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
            Swal.fire({
                title: 'Error en el registro',
                text: error.message === 'auth/email-already-in-use' ? 'El correo electrónico ya está en uso. Por favor, usa otro correo electrónico.' : `Error en el registro: ${error.message}`,
                icon: 'error',
            });
            console.error("Error en el registro:", error);
        });
}

function iniciarSesion() {
    const email = document.getElementById('usuario').value;
    const password = document.getElementById('clave').value;

    // Validar campos llenos y formato
    if (!email || !password) {
        Swal.fire({
            title: 'Campos vacíos',
            text: 'Por favor, completa todos los campos.',
            icon: 'warning',
        });
        return;
    }

    // Validar formato de correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        Swal.fire({
            title: 'Correo electrónico inválido',
            text: 'Por favor, ingresa un correo electrónico válido.',
            icon: 'warning',
        });
        return;
    }

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;

            if (user.emailVerified) {
                console.log("Usuario inició sesión:", user);

                // Guardar datos del usuario en localStorage
                localStorage.setItem('user', JSON.stringify({
                    uid: user.uid,
                    displayName: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL
                }));

                window.location.href = "main.html";
            } else {
                auth.signOut();
                Swal.fire({
                    title: 'Correo no verificado',
                    text: 'Por favor, verifica tu correo electrónico antes de iniciar sesión.',
                    icon: 'warning',
                });
            }
        })
        .catch((error) => {
            console.error("Error en el inicio de sesión:", error);

            let swalTitle = 'Error en el inicio de sesión';
            let swalText = 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.';

            if (error.code === 'auth/user-not-found') {
                swalTitle = 'Usuario no registrado';
                swalText = 'No se encontró ninguna cuenta con este correo electrónico. Por favor, regístrate primero.';
            } else if (error.code === 'auth/wrong-password') {
                swalTitle = 'Contraseña incorrecta';
                swalText = 'La contraseña ingresada es incorrecta. Por favor, inténtalo nuevamente.';
            } else if (error.code === 'auth/invalid-email') {
                swalTitle = 'Correo electrónico inválido';
                swalText = 'El correo electrónico ingresado no es válido. Por favor, verifica e inténtalo de nuevo.';
            }

            Swal.fire({
                title: swalTitle,
                text: swalText,
                icon: 'error',
            });
        });
}
