

// Cargar los condominios disponibles en el <select>
function cargarCondominios() {
    const user = firebase.auth().currentUser;
    if (user) {
        const userId = user.uid;
        const opcionesSelect = document.getElementById('opciones');

        firebase.firestore().collection('users').doc(userId).collection('condominios').get()
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    const option = document.createElement('option');
                    option.value = doc.id;
                    option.textContent = doc.data().name;
                    opcionesSelect.appendChild(option);
                });
            })
            .catch((error) => {
                console.error('Error al cargar los condominios:', error);
            });
    } else {
        console.error('No hay usuario autenticado.');
    }
}

// Llamar a la función para cargar los condominios al cargar la página
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        cargarCondominios();
    }
});

// Función para generar un código QR con el ID del condominio seleccionado
function generarCodigoQR() {
    const user = firebase.auth().currentUser;
    if (user) {
        const userId = user.uid;
        const condominioId = document.getElementById('opciones').value; // ID del condominio seleccionado

        if (!condominioId) {
            console.error('Por favor seleccione un condominio.');
            return;
        }

        // Construir el objeto de datos para el código QR
        const qrData = JSON.stringify({ userId, condominioId });

        // Mostrar el código QR en la interfaz
        const qrcodeContainer = document.getElementById('qrcodeContainer');
        qrcodeContainer.innerHTML = ''; // Limpiar contenido anterior
        new QRCode(qrcodeContainer, {
            text: qrData,
            width: 300,
            height: 300
        });
        console.log('QR generado con ID del condominio:', qrData); // Depuración
    } else {
        console.error('No hay usuario autenticado.');
    }
}

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
                    onScanSuccess(code.data);
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

// Función para procesar el QR escaneado y obtener los datos del condominio
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
                        // Mostrar los datos del condominio en la interfaz
                        mostrarDatosCondominio(condominioData);
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
function mostrarDatosCondominio(condominioData) {
    // Implementar la lógica para mostrar los datos del condominio en la interfaz
    console.log('Mostrando datos del condominio:', condominioData);
    // Puedes actualizar la interfaz con los datos del condominio aquí
}
