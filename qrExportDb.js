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

                                    // Mostrar los datos del condominio en la interfaz
                                    mostrarDatosCondominioEnInterfaz(condominioData);
                                })
                                .catch((error) => {
                                    console.error('Error al añadir el condominio a la cuenta actual:', error);
                                });

                            // Añadir los datos del condominio al usuario actual si existe
                            if (condominioData.datos) {
                                const datosCondominioRef = currentUserCondominiosRef.doc(condominioId).collection('datos');

                                // Añadir los datos del condominio al usuario actual
                                datosCondominioRef.doc().set(condominioData.datos)
                                    .then(() => {
                                        console.log('Datos del condominio añadidos correctamente a la cuenta actual.');
                                    })
                                    .catch((error) => {
                                        console.error('Error al añadir los datos del condominio a la cuenta actual:', error);
                                    });
                            } else {
                                console.warn('El condominio escaneado no contiene datos adicionales.');
                            }
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

// Función para mostrar los datos del condominio en la interfaz
function mostrarDatosCondominioEnInterfaz(condominioData) {
    // Implementar la lógica para mostrar los datos del condominio en la interfaz
    console.log('Mostrando datos del condominio en la interfaz:', condominioData);
    // Actualizar elementos HTML para mostrar los datos del condominio
    const opcionesSelect = document.getElementById('opciones');
    opcionesSelect.innerHTML = ''; // Limpiar opciones anteriores

    const option = document.createElement('option');
    option.value = condominioData.name;
    option.textContent = condominioData.name;
    opcionesSelect.appendChild(option);

    // Llamar a la función para cargar los datos del condominio seleccionado (si está definida)
    if (typeof cargarDatosCondominioSeleccionado === 'function') {
        cargarDatosCondominioSeleccionado(condominioData);
    } else {
        console.warn('La función cargarDatosCondominioSeleccionado no está definida.');
    }
}

// Función para generar y mostrar el código QR
function generarCodigoQR() {
    const user = firebase.auth().currentUser;
    if (user) {
        const userId = user.uid;
        const nombreCondominio = document.getElementById('opciones').value;

        if (!nombreCondominio) {
            console.error('Por favor ingrese el nombre del condominio.');
            return;
        }

        // Añadir un nuevo documento a la colección 'condominios' con ID automático
        const newCondominioRef = firebase.firestore().collection('users').doc(userId).collection('condominios').doc();

        // Obtener el ID generado por Firestore
        const selectedCondominioId = newCondominioRef.id;

        // Construir el objeto de datos para el código QR
        const qrData = JSON.stringify({ userId, condominioId: selectedCondominioId });

        // Almacenar los datos del condominio en Firestore
        newCondominioRef.set({
            name: nombreCondominio, // Utilizar el nombre ingresado por el usuario
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            datos: { // Aquí puedes agregar cualquier dato adicional que desees
                residents: 'residentes de prueba',
                otherData: 'otros datos de prueba'
            }
        }).then(() => {
            // Mostrar el código QR en la interfaz
            const qrcodeContainer = document.getElementById('qrcodeContainer');
            qrcodeContainer.innerHTML = ''; // Limpiar contenido anterior
            new QRCode(qrcodeContainer, {
                text: qrData,
                width: 300,
                height: 300
            });
            console.log('QR generado con ID del condominio:', qrData); // Depuración
        }).catch((error) => {
            console.error('Error al almacenar los datos del condominio en Firestore:', error);
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

// Función para cargar los datos del condominio seleccionado en la interfaz
function cargarDatosCondominioSeleccionado(condominioData) {
    console.log('Cargando datos del condominio seleccionado:', condominioData);
    // Implementa aquí la lógica para cargar los datos del condominio seleccionado en la interfaz
    // Por ejemplo, podrías actualizar elementos HTML con los datos del condominio
    const residentsList = document.getElementById('residentsList');
    residentsList.innerHTML = ''; // Limpiar lista anterior

    if (condominioData.datos && condominioData.datos.residents) {
        const residents = condominioData.datos.residents;
        residents.forEach(resident => {
            const listItem = document.createElement('li');
            listItem.textContent = resident.name; // Suponiendo que cada residente tiene un campo 'name'
            residentsList.appendChild(listItem);
        });
    } else {
        console.warn('No se encontraron datos de residentes para el condominio seleccionado.');
    }
}
