function handleQRScan(decodedText) {
    try {
        const { userId, condominioId } = JSON.parse(decodedText);
        console.log(`Escaneado QR con userId: ${userId}, condominioId: ${condominioId}`);
        if (userId && condominioId) {
            const sourceCondominioRef = firebase.firestore().collection('users').doc(userId).collection('condominios').doc(condominioId);

            console.log('Buscando datos del condominio en Firestore...');
            sourceCondominioRef.get()
                .then((doc) => {
                    if (doc.exists) {
                        const condominioData = doc.data();
                        console.log('Datos del condominio obtenidos:', condominioData);

                        const currentUser = firebase.auth().currentUser;
                        if (currentUser) {
                            const currentUserUid = currentUser.uid;
                            const currentUserCondominiosRef = firebase.firestore().collection('users').doc(currentUserUid).collection('condominios');

                            console.log('Guardando el condominio en la cuenta actual...');
                            currentUserCondominiosRef.doc(condominioId).set(condominioData)
                                .then(() => {
                                    console.log('Condominio añadido correctamente a la cuenta actual.');

                                    const sourceCondominioNameRef = firebase.firestore().collection('users').doc(userId).collection('condominios').doc(condominioData.name);
                                    const targetCondominioNameRef = firebase.firestore().collection('users').doc(currentUserUid).collection('condominios').doc(condominioData.name);

                                    sourceCondominioNameRef.get()
                                        .then((nameDoc) => {
                                            if (nameDoc.exists) {
                                                const condominioNameData = nameDoc.data();
                                                targetCondominioNameRef.set(condominioNameData)
                                                    .then(() => {
                                                        console.log('Documento del nombre del condominio migrado correctamente.');
                                                        migrarPropiedadesYResidentes(sourceCondominioNameRef, targetCondominioNameRef);
                                                        mostrarDatosCondominioEnInterfaz(condominioData);
                                                    })
                                                    .catch((error) => {
                                                        console.error('Error al migrar el documento del nombre del condominio:', error);
                                                    });
                                            } else {
                                                console.error('No se encontró el documento del nombre del condominio.');
                                            }
                                        })
                                        .catch((error) => {
                                            console.error('Error al obtener el documento del nombre del condominio:', error);
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

function migrarPropiedadesYResidentes(sourceCondominioRef, targetCondominioRef) {
    const propiedadesRef = sourceCondominioRef.collection('propiedades');

    console.log('Obteniendo propiedades del condominio...');
    propiedadesRef.get()
        .then((querySnapshot) => {
            if (!querySnapshot.empty) {
                console.log('Propiedades encontradas. Migrando...');
                const batch = firebase.firestore().batch();

                querySnapshot.forEach((propiedadDoc) => {
                    const propiedadData = propiedadDoc.data();
                    const newPropiedadRef = targetCondominioRef.collection('propiedades').doc(propiedadDoc.id);

                    batch.set(newPropiedadRef, propiedadData);

                    const residentesRef = propiedadDoc.ref.collection('residentes');
                    const newResidentesRef = newPropiedadRef.collection('residentes');

                    residentesRef.get()
                        .then((residentsSnapshot) => {
                            if (!residentsSnapshot.empty) {
                                residentsSnapshot.forEach((residentDoc) => {
                                    batch.set(newResidentesRef.doc(residentDoc.id), residentDoc.data());
                                });
                            } else {
                                console.log('No se encontraron residentes para migrar en la propiedad:', propiedadDoc.id);
                            }
                        })
                        .catch((error) => {
                            console.error('Error al obtener los residentes de la propiedad:', error);
                        });
                });

                batch.commit()
                    .then(() => {
                        console.log('Migración completa de propiedades y residentes.');
                    })
                    .catch((error) => {
                        console.error('Error al ejecutar el lote de escritura:', error);
                    });
            } else {
                console.log('No se encontraron propiedades para migrar.');
            }
        })
        .catch((error) => {
            console.error('Error al obtener las propiedades del condominio:', error);
        });
}



function mostrarDatosCondominioEnInterfaz(condominioData) {
    console.log('Mostrando datos del condominio en la interfaz:', condominioData);
    const opcionesSelect = document.getElementById('opciones');
    if (!opcionesSelect) {
        console.error('Elemento #opciones no encontrado en el DOM.');
        return;
    }

    const option = document.createElement('option');
    option.value = condominioData.name;
    option.textContent = condominioData.name;
    opcionesSelect.appendChild(option);

    const residentsList = document.getElementById('residentsList');
    if (residentsList) {
        residentsList.innerHTML = ''; 
        if (condominioData.datos && condominioData.datos.residents) {
            const residents = condominioData.datos.residents;
            residents.forEach(resident => {
                const listItem = document.createElement('li');
                listItem.textContent = resident.name;
                residentsList.appendChild(listItem);
            });
        }
    } else {
        console.error('Elemento #residentsList no encontrado en el DOM.');
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

        condominiosRef.where('name', '==', nombreCondominio).get()
            .then(snapshot => {
                if (!snapshot.empty) {
                    const existingCondominioId = snapshot.docs[0].id;
                    console.error('El condominio ya existe. Generando QR con el ID existente.');
                    const qrData = JSON.stringify({ userId, condominioId: existingCondominioId });

                    const qrcodeContainer = document.getElementById('qrcodeContainer');
                    qrcodeContainer.innerHTML = '';
                    new QRCode(qrcodeContainer, {
                        text: qrData,
                        width: 300,
                        height: 300
                    });
                    return;
                }

                const newCondominioRef = condominiosRef.doc();
                const selectedCondominioId = newCondominioRef.id;

                const qrData = JSON.stringify({ userId, condominioId: selectedCondominioId });

                newCondominioRef.set({
                    name: nombreCondominio,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    datos: {
                        residents: []
                    }
                }).then(() => {
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

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const startButton = document.getElementById('startButton');
const context = canvas.getContext('2d');
let currentStream;

startButton.addEventListener('click', async () => {
    try {
        const constraints = {
            video: {
                facingMode: 'environment'
            }
        };
        await startCamera(constraints);
    } catch (error) {
        console.error('Error al acceder a la cámara:', error);
    }
});

async function startCamera(constraints) {
    try {
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        currentStream = stream;

        video.srcObject = stream;
        video.play();
        video.style.display = "block";
        canvas.style.display = "none";

        video.addEventListener('play', () => {
            console.log('El video está reproduciéndose');
            const drawFrame = () => {
                if (video.paused || video.ended) {
                    return;
                }
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                requestAnimationFrame(drawFrame);
            };
            requestAnimationFrame(drawFrame);
        });

        video.addEventListener('canplay', () => {
            console.log('La cámara está lista para usarse');
            video.play();
        });
    } catch (error) {
        console.error('Error al iniciar la cámara:', error);
    }
}

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
        const condominioSeleccionado = document.getElementById('opciones').value;
        const propiedadesRef = firebase.firestore().collection('users').doc(userId).collection('condominios').doc(condominioSeleccionado).collection('propiedades');

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
