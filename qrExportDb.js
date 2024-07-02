const handleQRScan = async (data) => {
    try {
        const { userId, condominioId, condominioData } = JSON.parse(data);
        const { name: condominioName } = condominioData;

        console.log(`Escaneado QR con userId: ${userId}, condominioId: ${condominioId}, nombre del condominio: ${condominioName}`);

        // Buscar datos del condominio principal
        const condominioDocRef = firebase.firestore()
            .collection('users')
            .doc(userId)
            .collection('condominios')
            .doc(condominioId);

        const condominioDocSnapshot = await condominioDocRef.get();

        if (!condominioDocSnapshot.exists) {
            throw new Error(`El condominio con ID ${condominioId} no existe.`);
        }

        console.log(`Datos del condominio obtenidos:`, condominioDocSnapshot.data());

        // Guardar el condominio principal en la cuenta actual
        const currentUser = firebase.auth().currentUser;
        const newCondominioRef = firebase.firestore()
            .collection('users')
            .doc(currentUser.uid)
            .collection('condominios')
            .doc(condominioId);

        await newCondominioRef.set(condominioDocSnapshot.data());

        console.log(`Condominio principal añadido correctamente a la cuenta actual.`);

        // Obtener y copiar la subcolección 'propiedades' desde el documento con el nombre del condominio
        const condominioWithNameRef = firebase.firestore()
            .collection('users')
            .doc(userId)
            .collection('condominios')
            .doc(condominioName);

        const propiedadesRef = condominioWithNameRef.collection('propiedades');
        const propiedadesSnapshot = await propiedadesRef.get();

        if (propiedadesSnapshot.empty) {
            console.log(`No se encontraron propiedades para migrar.`);
            return;
        }

        const newCondominioWithNameRef = firebase.firestore()
            .collection('users')
            .doc(currentUser.uid)
            .collection('condominios')
            .doc(condominioName);

        const newPropiedadesRef = newCondominioWithNameRef.collection('propiedades');
        const batch = firebase.firestore().batch();

        propiedadesSnapshot.forEach(doc => {
            batch.set(newPropiedadesRef.doc(doc.id), doc.data());
        });

        await batch.commit();

        console.log(`Propiedades del condominio ${condominioName} copiadas correctamente.`);

    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
};

// Función para mostrar los datos del condominio en la interfaz
function mostrarDatosCondominioEnInterfaz(condominioData) {
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
        if (condominioData.datos && condominioData.datos.residents) {
            const residents = condominioData.datos.residents;
            residents.forEach(resident => {
                const listItem = document.createElement('li');
                listItem.textContent = resident.name; // Suponiendo que cada residente tiene un campo 'name'
                residentsList.appendChild(listItem);
            });
        }
    } else {
        console.error('Elemento #residentsList no encontrado en el DOM.');
    }
}

// Función para generar y mostrar el código QR de un condominio
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

                    // Obtener todos los datos del condominio existente
                    snapshot.docs.forEach(doc => {
                        const condominioData = doc.data();

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
                    });

                    return;
                }

                // Añadir un nuevo documento a la colección 'condominios' con ID automático
                const newCondominioRef = condominiosRef.doc();

                // Obtener el ID generado por Firestore
                const selectedCondominioId = newCondominioRef.id;

                // Construir el objeto de datos para el código QR
                const qrData = JSON.stringify({
                    userId,
                    condominioId: selectedCondominioId,
                    name: nombreCondominio,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    datos: {
                        residents: [] // Ejemplo de estructura de datos
                    }
                });

                // Almacenar los datos del condominio en Firestore
                newCondominioRef.set({
                    name: nombreCondominio,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    datos: {
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
                    console.log('QR generado con ID del condominio nuevo:', qrData);
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

// Función para cargar los datos de un condominio seleccionado
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
