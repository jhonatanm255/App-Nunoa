
// FUNCION PARA ACTIVAR LA CAMARA Y EL LECTOR DE CODIGOS QR
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
        console.error('Error accessing the camera:', error);
    }
});

// Función para iniciar la cámara con las restricciones dadas
async function startCamera(constraints) {
    try {
        // Detener la cámara actual si hay alguna
        if (currentStream) {
            currentStream.getTracks().forEach(track => {
                track.stop();
            });
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
                if (video.paused || video.ended) {
                    return;
                }
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);
                if (code) {
                    console.log('Found QR code', code.data);
                    // Cerrar la cámara después de encontrar un código QR
                    stopCamera();
                    video.style.display = "none"
                    canvas.style.display = "none"
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
        currentStream.getTracks().forEach(track => {
            track.stop();
        });
        currentStream = null;
    }
}

    function exportarDatosCondominio(condominioId) {
        const userId = firebase.auth().currentUser.uid;
        const db = firebase.firestore();
        const docRef = db.collection('usuarios').doc(userId).collection('condominios').doc(condominioId).collection('propiedades');
        
        docRef.get().then((querySnapshot) => {
          const data = [];
          querySnapshot.forEach((doc) => {
            data.push(doc.data());
          });
          const json = JSON.stringify(data);
          descargarArchivo(json, 'datos_condominio.json');
        });
      }
      
      function descargarArchivo(contenido, nombreArchivo) {
        const a = document.createElement('a');
        const archivo = new Blob([contenido], { type: 'application/json' });
        a.href = URL.createObjectURL(archivo);
        a.download = nombreArchivo;
        a.click();
      }
       
      

   