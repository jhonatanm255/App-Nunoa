// Función para manejar el escaneo del QR
function handleQRScan(decodedText) {
    try {
        const { userId, condominioId } = JSON.parse(decodedText);
        if (userId && condominioId) {
            // Acceder al condominio en la colección del usuario que lo generó
            const condominioRef = firebase.firestore().collection('users').doc(userId).collection('condominios').doc(condominioId);

            condominioRef.get()
                .then((doc) => {
                    if (doc.exists) {
                        const condominioData = doc.data();

                        // Guardar el condominio en la colección del usuario actual
                        const currentUser = firebase.auth().currentUser;
                        if (currentUser) {
                            const currentUserUid = currentUser.uid;
                            const currentUserCondominiosRef = firebase.firestore().collection('users').doc(currentUserUid).collection('condominios');

                            // Añadir el condominio al usuario actual
                            currentUserCondominiosRef.doc(condominioId).set(condominioData)
                                .then(() => {
                                    console.log('Condominio añadido correctamente a la cuenta actual.');

                                    // Transferir las subcolecciones como propiedades
                                    transferirSubcolecciones(userId, currentUserUid, condominioId, 'propiedades')
                                        .then(() => {
                                            // Mostrar los datos del condominio en la interfaz
                                            mostrarDatosCondominioEnInterfaz(condominioData, currentUserUid, condominioId);
                                        })
                                        .catch((error) => {
                                            console.error('Error al transferir las subcolecciones:', error);
                                        });
                                })
                                .catch((error) => {
                                    console.error('Error al añadir el condominio a la cuenta actual:', error);
                                });
                        } else {
                            console.error('No hay usuario autenticado.');
                        }
                    } else {
                        console.error('No se encontraron datos del condominio con el ID proporcionado.');
                    }
                })
                .catch((error) => {
                    console.error('Error al obtener los datos del condominio:', error);
                });
        } else {
            console.error('El QR escaneado no contiene información válida.');
        }
    } catch (error) {
        console.error('Error al procesar el QR escaneado:', error);
    }
}

// Función para transferir las subcolecciones de un condominio
function transferirSubcolecciones(origUserId, destUserId, condominioId, subcoleccion) {
    return new Promise((resolve, reject) => {
        const origSubcoleccionRef = firebase.firestore().collection('users').doc(origUserId).collection('condominios').doc(condominioId).collection(subcoleccion);
        const destSubcoleccionRef = firebase.firestore().collection('users').doc(destUserId).collection('condominios').doc(condominioId).collection(subcoleccion);

        origSubcoleccionRef.get().then(querySnapshot => {
            const batch = firebase.firestore().batch();
            querySnapshot.forEach(doc => {
                batch.set(destSubcoleccionRef.doc(doc.id), doc.data());
            });
            batch.commit()
                .then(() => {
                    console.log(`Datos de la subcolección ${subcoleccion} transferidos correctamente.`);
                    resolve();
                })
                .catch((error) => {
                    console.error(`Error al transferir los datos de la subcolección ${subcoleccion}:`, error);
                    reject(error);
                });
        }).catch((error) => {
            console.error(`Error al obtener los datos de la subcolección ${subcoleccion} del condominio:`, error);
            reject(error);
        });
    });
}

// Función para mostrar datos del condominio en la interfaz, incluyendo propiedades
function mostrarDatosCondominioEnInterfaz(condominioData, userId, condominioId) {
    console.log('Mostrando datos del condominio en la interfaz:', condominioData);
    const opcionesSelect = document.getElementById('opciones');
    if (!opcionesSelect) {
        console.error('Elemento #opciones no encontrado en el DOM.');
        return;
    }

    // Añadir una nueva opción al select con los datos del condominio
    const option = document.createElement('option');
    option.value = condominioData.name;
    option.textContent = condominioData.name;
    opcionesSelect.appendChild(option);

    // Actualizar la interfaz con los datos del condominio
    const residentsList = document.getElementById('residentsList');
    if (residentsList) {
        residentsList.innerHTML = ''; // Limpiar lista anterior
        const propiedadesRef = firebase.firestore().collection('users').doc(userId).collection('condominios').doc(condominioId).collection('propiedades');
        propiedadesRef.get()
            .then(querySnapshot => {
                querySnapshot.forEach(doc => {
                    const listItem = document.createElement('li');
                    listItem.textContent = doc.data().name; // Suponiendo que cada propiedad tiene un campo 'name'
                    residentsList.appendChild(listItem);
                });
            })
            .catch((error) => {
                console.error('Error al obtener las propiedades del condominio:', error);
            });
    } else {
        console.error('Elemento #residentsList no encontrado en el DOM.');
    }
}




function onScanSuccess(decodedText) {
    try {
        const { userId, condominioId } = JSON.parse(decodedText);
        if (userId && condominioId) {
            // Acceder directamente a los datos del condominio en Firestore
            const condominioRef = firebase.firestore().collection('users').doc(userId).collection('condominios').doc(condominioId);

            condominioRef.get()
                .then((doc) => {
                    if (doc.exists) {
                        const condominioData = doc.data();
                        // Convertir el timestamp de Firestore a una fecha legible
                        if (condominioData.createdAt) {
                            condominioData.createdAt = condominioData.createdAt.toDate();
                        }

                        console.log('Datos del condominio:', condominioData);

                        // Obtener el usuario autenticado
                        const currentUser = firebase.auth().currentUser;
                        if (currentUser) {
                            const currentUserId = currentUser.uid;

                            // Añadir el condominio a la cuenta del usuario que escanea
                            firebase.firestore().collection('users').doc(currentUserId).collection('condominios').add(condominioData)
                                .then(() => {
                                    console.log('Condominio añadido correctamente a la cuenta actual.');
                                    mostrarDatosCondominioEnInterfaz(condominioData);
                                })
                                .catch((error) => {
                                    console.error('Error al añadir el condominio a la cuenta actual:', error);
                                });
                        } else {
                            console.error('No hay usuario autenticado.');
                        }
                    } else {
                        console.error('No se encontraron datos del condominio con el ID proporcionado.');
                    }
                })
                .catch((error) => {
                    console.error('Error al obtener los datos del condominio:', error);
                });
        } else {
            console.error('El QR escaneado no contiene información válida.');
        }
    } catch (error) {
        console.error('Error al procesar el QR escaneado:', error);
    }
}





function generarCodigoQR() {
    const user = firebase.auth().currentUser;
    if (user) {
        const userId = user.uid;
        const nombreCondominio = document.getElementById('opciones').value;

        if (!nombreCondominio) {
            console.error('Por favor ingrese el nombre del condominio.');
            return;
        }

        const condominiosRef = firebase.firestore().collection('users').doc(userId).collection('condominios');

        // Verificar si el condominio ya existe
        condominiosRef.where('name', '==', nombreCondominio).get()
            .then(snapshot => {
                if (!snapshot.empty) {
                    const existingCondominioId = snapshot.docs[0].id;
                    console.error('El condominio ya existe. Generando QR con el ID existente.');
                    const qrData = JSON.stringify({ userId, condominioId: existingCondominioId });

                    // Mostrar el código QR en la interfaz
                    const qrcodeContainer = document.getElementById('qrcodeContainer');
                    qrcodeContainer.innerHTML = '';
                    new QRCode(qrcodeContainer, {
                        text: qrData,
                        width: 300,
                        height: 300
                    });
                    return;
                }

                // Añadir un nuevo documento a la colección 'condominios' con ID automático
                const newCondominioRef = condominiosRef.doc();

                // Obtener el ID generado por Firestore
                const selectedCondominioId = newCondominioRef.id;

                // Construir el objeto de datos para el código QR
                const qrData = JSON.stringify({ userId, condominioId: selectedCondominioId });

                // Almacenar los datos del condominio en Firestore
                newCondominioRef.set({
                    name: nombreCondominio,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    datos: {
                        // Incluye aquí todos los datos que quieras copiar
                        residents: [] // Ejemplo de estructura de datos
                    }
                }).then(() => {
                    // Mostrar el código QR en la interfaz
                    const qrcodeContainer = document.getElementById('qrcodeContainer');
                    qrcodeContainer.innerHTML = '';
                    new QRCode(qrcodeContainer, {
                        text: qrData,
                        width: 300,
                        height: 300
                    });
                    console.log('QR generado con ID del condominio:', qrData);
                }).catch((error) => {
                    console.error('Error al almacenar los datos del condominio en Firestore:', error);
                });
            })
            .catch((error) => {
                console.error('Error al verificar si el condominio ya existe:', error);
            });
    } else {
        console.error('No hay usuario autenticado.');
    }
}




// Función para manejar la interfaz y la cámara
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const startButton = document.getElementById('startButton');
const context = canvas.getContext('2d');
let currentStream;

// Event listener para iniciar la cámara
startButton.addEventListener('click', async () => {
    try {
        const constraints = {
            video: {
                facingMode: 'environment' // Configurar por defecto la cámara trasera
            }
        };
        await startCamera(constraints);
    } catch (error) {
        console.error('Error al acceder a la cámara:', error);
    }
});

// Función para iniciar la cámara con las restricciones dadas
async function startCamera(constraints) {
    try {
        // Detener la cámara actual si hay alguna
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
        }

        // Obtener un nuevo stream de la cámara según las restricciones
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        currentStream = stream;

        // Mostrar el video y ocultar el canvas
        video.srcObject = stream;
        video.play();
        video.style.display = "block";
        canvas.style.display = "none";

        // Event listener para detectar códigos QR mientras el video está en reproducción
        video.addEventListener('play', () => {
            console.log('El video está reproduciéndose');
            const drawFrame = () => {
                if (video.paused || video.ended) return;
                
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);
                if (code) {
                    console.log('Código QR encontrado', code.data);
                    // Cerrar la cámara después de encontrar un código QR
                    stopCamera();
                    video.style.display = "none";
                    canvas.style.display = "none";
                    handleQRScan(code.data); // Manejar los datos del QR escaneado
                }
                requestAnimationFrame(drawFrame);
            };
            drawFrame();
        });

    } catch (error) {
        console.error('Error al acceder a la cámara:', error);
    }
}

// Función para detener la cámara actual
function stopCamera() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
    }
}

function cargarDatosCondominioSeleccionado(condominioId) {
    const currentUser = firebase.auth().currentUser;
    if (currentUser) {
        const currentUserUid = currentUser.uid;
        const condominioRef = firebase.firestore().collection('users').doc(currentUserUid).collection('condominios').doc(condominioId);

        condominioRef.get()
            .then((doc) => {
                if (doc.exists) {
                    const condominioData = doc.data();
                    mostrarDatosCondominioEnInterfaz(condominioData);
                } else {
                    console.error('No se encontraron datos del condominio con el ID proporcionado.');
                }
            })
            .catch((error) => {
                console.error('Error al obtener los datos del condominio:', error);
            });
    } else {
        console.error('No hay usuario autenticado.');
    }
}

