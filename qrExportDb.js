// CONFIGURACIÓN DE LA CÁMARA Y LECTOR DE QR
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const startButton = document.getElementById('startButton');
const qrcodeContainer = document.getElementById('qrcode');
const listaCondominios = document.getElementById('opciones');
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
        console.error('Error accessing the camera:', error);
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
            console.log('Video is playing');
            const drawFrame = () => {
                if (video.paused || video.ended) return;
                
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);
                if (code) {
                    console.log('Found QR code', code.data);
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
        console.error('Error accessing the camera:', error);
    }
}

// Función para detener la cámara actual
function stopCamera() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
    }
}



function generarCodigoQR() {
    const selectedCondominioId = listaCondominios.value;
    if (selectedCondominioId) {
        const user = firebase.auth().currentUser;
        if (user) {
            const userId = user.uid;
            console.log('Generando código QR para el usuario:', userId);
            console.log('Condominio seleccionado:', selectedCondominioId);
            const qrData = JSON.stringify({ userId, condominioId: selectedCondominioId });
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
    } else {
        console.error('No se ha seleccionado ningún condominio.');
    }
}



function onScanSuccess(decodedText) {
    try {
        const { userId, condominioId } = JSON.parse(decodedText);
        if (userId && condominioId) {
            db.collection('users').doc(userId).collection('condominios').doc(condominioId).get()
            .then((doc) => {
                if (doc.exists) {
                    const condominioData = doc.data();
                    console.log('Datos del condominio:', condominioData);
                    // Aquí puedes mostrar los datos en tu aplicación
                    mostrarDatosCondominio(condominioData);
                } else {
                    console.error('No se encontraron datos del condominio con el ID proporcionado.');
                }
            })
            .catch((error) => {
                console.error('Error obteniendo los datos del condominio:', error);
            });
        } else {
            console.error('El QR escaneado no contiene información válida.');
        }
    } catch (error) {
        console.error('Error procesando el QR escaneado:', error);
    }
}

function mostrarDatosCondominio(condominioData) {
    // Implementa esta función para mostrar los datos del condominio en tu aplicación
    // Ejemplo: actualizar la interfaz de usuario con los datos del condominio
    console.log('Mostrando datos del condominio:', condominioData);
}
