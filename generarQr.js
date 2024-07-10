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
                    const existingCondominioDoc = snapshot.docs[0];
                    const existingCondominioId = existingCondominioDoc.id;
                    const condominioData = existingCondominioDoc.data();

                    console.log('El condominio ya existe. Generando QR con el ID existente.');

                    // Construir el objeto de datos para el código QR
                    const qrData = JSON.stringify({
                        userId,
                        condominioId: existingCondominioId,
                        condominioData  // Incluir todos los datos del condominio
                    });

                    // Mostrar el código QR en la interfaz
                    const qrcodeContainer = document.getElementById('qrcodeContainer');
                    qrcodeContainer.innerHTML = '';
                    new QRCode(qrcodeContainer, {
                        text: qrData,
                        width: 300,
                        height: 300
                    });
                    console.log('QR generado con ID del condominio existente:', qrData);
                } else {
                    // Añadir un nuevo documento a la colección 'condominios' con ID automático
                    const newCondominioRef = condominiosRef.doc();
                    const selectedCondominioId = newCondominioRef.id;

                    const newCondominioData = {
                        name: nombreCondominio,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        datos: {
                            residents: [] // Ejemplo de estructura de datos
                        }
                    };

                    // Construir el objeto de datos para el código QR
                    const qrData = JSON.stringify({
                        userId,
                        condominioId: selectedCondominioId,
                        condominioData: newCondominioData
                    });

                    // Almacenar los datos del condominio en Firestore
                    newCondominioRef.set(newCondominioData).then(() => {
                        // Mostrar el código QR en la interfaz
                        const qrcodeContainer = document.getElementById('qrcodeContainer');
                        qrcodeContainer.innerHTML = '';
                        new QRCode(qrcodeContainer, {
                            text: qrData,
                            width: 300,
                            height: 300
                        });
                        console.log('QR generado con ID del condominio nuevo:', qrData);
                        
                        // Cargar los datos del nuevo condominio en la interfaz
                        mostrarDatosCondominioEnInterfaz(newCondominioData);
                    }).catch((error) => {
                        console.error('Error al almacenar los datos del condominio en Firestore:', error);
                    });
                }
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

// Función para cargar los datos de un condominio seleccionado y actualizar la interfaz
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


