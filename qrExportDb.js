// CONFIGURACIÓN DE LA CÁMARA Y LECTOR DE QR
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
        currentStream.getTracks().forEach(track => {
            track.stop();
        });
        currentStream = null;
    }
}

const qrcodeContainer = document.getElementById('qrcode');
const listaCondominios = document.getElementById('opciones');

function generarCodigoQR() {
  const selectedCondominioId = listaCondominios.value;
  if (selectedCondominioId) {
      const user = firebase.auth().currentUser;
      if (user) {
          const userId = user.uid;
          console.log('Generando código QR para el usuario:', userId);
          console.log('Condominio seleccionado:', selectedCondominioId);
          db.collection('users').doc(userId).collection('condominios').doc(selectedCondominioId).get()
          .then((doc) => {
              if (doc.exists) {
                  const data = doc.data();
                  console.log('Datos del condominio:', data);
                  const exportData = {
                      userId: userId,
                      condominioId: selectedCondominioId,
                      condominio: data
                  };
                  const jsonData = JSON.stringify(exportData);
                  qrcodeContainer.innerHTML = ''; // Limpiar contenido anterior
                  new QRCode(qrcodeContainer, {
                      text: jsonData,
                      width: 300,
                      height: 300
                  });
                  console.log('QR generado:', jsonData); // Depuración
              } else {
                  console.error('No se encontró el condominio seleccionado.');
              }
          })
          .catch((error) => {
              console.error('Error obteniendo condominio:', error);
          });
      } else {
          console.error('No hay usuario autenticado.');
      }
  } else {
      console.error('No se ha seleccionado ningún condominio.');
  }
}

function exportData() {
  const user = firebase.auth().currentUser;
  if (user) {
      const userId = user.uid;
      db.collection('users').doc(userId).collection('condominios').get()
      .then((querySnapshot) => {
          const condominios = [];
          querySnapshot.forEach((doc) => {
              const data = doc.data();
              const condominioId = doc.id;
              condominios.push({ condominioId, data });
          });
          const exportData = {
              userId: userId,
              condominios: condominios
          };
          const jsonData = JSON.stringify(exportData);
          qrcodeContainer.innerHTML = ''; // Limpiar contenido anterior
          new QRCode(qrcodeContainer, {
              text: jsonData,
              width: 300,
              height: 300
          });
          console.log('QR generado con exportación de datos:', jsonData); // Depuración
      })
      .catch((error) => {
          console.error('Error obteniendo condominios: ', error);
      });
  } else {
      console.log('No hay usuario autenticado');
  }
}


function onScanSuccess(decodedText) {
  try {
      const importData = JSON.parse(decodedText);
      const condominio = importData.condominio;
      const user = firebase.auth().currentUser;
      if (user) {
          const userId = user.uid;
          db.collection('users').doc(userId).collection('condominios').doc(importData.condominioId).set(condominio)
          .then(() => {
              console.log('Condominio agregado correctamente');
          })
          .catch((error) => {
              console.error('Error agregando condominio:', error);
          });
      } else {
          console.log('No hay usuario autenticado');
      }
  } catch (error) {
      console.error('Error procesando el QR escaneado:', error);
  }
  // Detener el escáner
  qrCodeScanner.clear();
}

