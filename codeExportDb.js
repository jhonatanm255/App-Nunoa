// GENERAR CODIGO NUMERICO DE 4 DIGITOS PARA EXPORTAR LOS DATOS
const btnGenerateCode = document.getElementById('export');
const exportCodeContainer = document.getElementById('exportCodeContainer');
const exportCodeSpan = document.getElementById('exportCode');

btnGenerateCode.addEventListener('click', async () => {
    try {
        const exportCode = generateRandomNumericCode(4);
        exportCodeSpan.textContent = exportCode;
        exportCodeContainer.style.display = 'block';
        console.log('Export code generated:', exportCode);
        exportCodeContainer.innerText = exportCode;

        const userId = firebase.auth().currentUser.uid;

        await firebase.firestore().collection('migrationCodes').doc(exportCode).set({
            userId: userId,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

    } catch (error) {
        console.error('Error generating export code:', error);
    }
});

function generateRandomNumericCode(length) {
    const characters = '0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// FUNCION PARA INGRESAR EL CODIGO EN EL DISPOSITIVO RECEPTOR
const btnFormCode = document.getElementById('import');
btnFormCode.addEventListener('click', () => {
    const importContent = document.getElementById('container-import');
    importContent.style.display = 'block';
    const overlay = document.querySelector('.overlay');
    overlay.style.display = 'block'
    const myModal = document.getElementById('myModal');
    myModal.style.display = 'none';

    // Cerrar el Modal al Hacer Clic en el Botón de Cerrar
    const closeBtn = document.querySelector('#container-import .close');
    closeBtn.addEventListener('click', () => {
    const importContent = document.getElementById('container-import');
    importContent.style.display = 'none';
    const overlay = document.querySelector('.overlay');
    overlay.style.display = 'none'
});
});

async function importData() {
    const importCode = document.getElementById('importCode').value;

    const doc = await firebase.firestore().collection('migrationCodes').doc(importCode).get();
    if (!doc.exists) {
        console.log('Invalid code');
        return;
    }

    const { userId } = doc.data();
    handleDataMigration(userId);
}

// FUNCION DE MIGRACION DE DATOS
const handleDataMigration = async (userId) => {
    try {
        const currentUser = firebase.auth().currentUser;

        // Buscar todos los documentos de los condominios del usuario origen
        const condominiosSnapshot = await firebase.firestore()
            .collection('users')
            .doc(userId)
            .collection('condominios')
            .get();

        if (condominiosSnapshot.empty) {
            console.log('No se encontraron condominios para migrar.');
            return;
        }

        const batch = firebase.firestore().batch();

        // Iterar sobre cada condominio para copiarlo
        await Promise.all(condominiosSnapshot.docs.map(async (doc) => {
            const condominioData = doc.data();
            const condominioId = doc.id;
            console.log(`Intentando obtener los datos del condominio con ID: ${condominioId}`);

            // Guardar el condominio principal en la cuenta actual
            const newCondominioRef = firebase.firestore()
                .collection('users')
                .doc(currentUser.uid)
                .collection('condominios')
                .doc(condominioId);

            batch.set(newCondominioRef, condominioData);

            // Obtener y copiar la subcolección 'propiedades' desde el documento original
            const propiedadesSnapshot = await doc.ref.collection('propiedades').get();

            if (!propiedadesSnapshot.empty) {
                const newPropiedadesRef = newCondominioRef.collection('propiedades');
                propiedadesSnapshot.forEach(propDoc => {
                    batch.set(newPropiedadesRef.doc(propDoc.id), propDoc.data());

                    // Obtener y copiar la subcolección 'residentes'
                    propDoc.ref.collection('residentes').get().then(residentesSnapshot => {
                        residentesSnapshot.forEach(residentDoc => {
                            const newResidentRef = newPropiedadesRef.doc(propDoc.id).collection('residentes').doc(residentDoc.id);
                            batch.set(newResidentRef, residentDoc.data());
                        });
                    });
                });
            }
        }));

        await batch.commit();
        console.log('Datos migrados exitosamente.');

        // Actualizar la interfaz con los datos del nuevo condominio copiado
        const newCondominioData = await Promise.all(condominiosSnapshot.docs.map(async (doc) => {
            const condominioName = doc.data().name;
            const propiedadesSnapshot = await doc.ref.collection('propiedades').get();
            const residents = propiedadesSnapshot.docs.map(doc => doc.data());
            return {
                name: condominioName,
                datos: {
                    residents: residents
                }
            };
        }));

        mostrarDatosCondominioEnInterfaz(newCondominioData);

    } catch (error) {
        console.error('Error:', error.message);
    }
};

// MOSTRAR DATOS DEL CONDOMINIO EN LA INTERFAZ
function mostrarDatosCondominioEnInterfaz(condominios) {
    const opcionesSelect = document.getElementById('opciones');
    if (!opcionesSelect) {
        console.error('Elemento #opciones no encontrado en el DOM.');
        return;
    }

    condominios.forEach(condominioData => {
        const option = document.createElement('option');
        option.value = condominioData.name;
        option.textContent = condominioData.name;
        opcionesSelect.appendChild(option);

        const residentsList = document.getElementById('residentsList');
        if (residentsList) {
            residentsList.innerHTML = ''; // Limpiar lista anterior
            condominioData.datos.residents.forEach(resident => {
                const listItem = document.createElement('li');
                listItem.textContent = resident.name; // Suponiendo que cada residente tiene un campo 'name'
                residentsList.appendChild(listItem);
            });
        } else {
            console.error('Elemento #residentsList no encontrado en el DOM.');
        }
    });
}
