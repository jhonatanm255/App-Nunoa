// Función para generar un ID único (UUID)
function generateUniqueId() {
    return 'xxxx-xxxx-xxxx-xxxx'.replace(/x/g, function() {
        return (Math.random() * 16 | 0).toString(16);
    });
}

function generarCodigoQR() {
    const user = firebase.auth().currentUser;
    if (user) {
        const userId = user.uid;

        // Añadir un nuevo documento a la colección 'condominios' con ID automático
        const newCondominioRef = firebase.firestore().collection('users').doc(userId).collection('condominios').doc();

        // Obtener el ID generado por Firestore
        const selectedCondominioId = newCondominioRef.id;

        // Construir el objeto de datos para el código QR
        const qrData = JSON.stringify({ userId, condominioId: selectedCondominioId });

        // Almacenar los datos del condominio en Firestore
        newCondominioRef.set({
            name: 'Nombre del condominio', // Aquí puedes ajustar según tu aplicación
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            // Mostrar el código QR en la interfaz
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
                        console.log('Datos del condominio:', condominioData);
                        // Aquí puedes mostrar los datos en tu aplicación
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


function mostrarDatosCondominio(condominioData) {
    // Implementa esta función para mostrar los datos del condominio en tu aplicación
    // Ejemplo: actualizar la interfaz de usuario con los datos del condominio
    console.log('Mostrando datos del condominio:', condominioData);
    // Aquí puedes actualizar elementos de la UI para mostrar los datos
}
