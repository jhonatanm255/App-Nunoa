// GENERAR CODIGO RAMDON PARA EXPORTAR LOS DATOS
const btnGenerateCode = document.getElementById('export');
btnGenerateCode.addEventListener('click', async () => {
    const exportCodeContainer = document.getElementById('exportCodeContainer');
    const exportCodeSpan = document.getElementById('exportCode');
    
    try {
        const exportCode = await generateExportCode();
        exportCodeSpan.textContent = exportCode; // Mostrar el código generado en el span
        exportCodeContainer.style.display = 'block'; // Mostrar el contenedor
        console.log('Export code generated:', exportCode);
    } catch (error) {
        console.error('Error generating export code:', error);
    }
});

function generateRandomCode(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

const generateExportCode = async () => {
    const exportCode = generateRandomCode(6);
    const userId = firebase.auth().currentUser.uid;

    await firebase.firestore().collection('migrationCodes').doc(exportCode).set({
        userId: userId,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    return exportCode;
}


// FUNCION PARA INGRESAR EL CODIGO EN EL DISPOSITIVO RECEPTOR
const btnFormCode = document.getElementById('import');
btnFormCode.addEventListener('click', () => {
    const importContent = document.getElementById('container-import');
    importContent.style.display = 'block';
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
            console.log('No condominiums found for migration.');
            return;
        }

        const batch = firebase.firestore().batch();

        condominiosSnapshot.forEach(async (doc) => {
            const condominioData = doc.data();
            const condominioId = doc.id;

            // Guardar el condominio principal en la cuenta actual
            const newCondominioRef = firebase.firestore()
                .collection('users')
                .doc(currentUser.uid)
                .collection('condominios')
                .doc(condominioId);

            batch.set(newCondominioRef, condominioData);

            // Obtener y copiar la subcolección 'propiedades' desde el documento con el nombre del condominio
            const propiedadesSnapshot = await doc.ref.collection('propiedades').get();

            propiedadesSnapshot.forEach(propDoc => {
                const newPropDocRef = newCondominioRef.collection('propiedades').doc(propDoc.id);
                batch.set(newPropDocRef, propDoc.data());
            });
        });

        await batch.commit();
        console.log('Data migrated successfully.');

        // Actualizar la interfaz con los datos del nuevo condominio copiado
        const newCondominioData = condominiosSnapshot.docs.map(doc => {
            return {
                name: doc.data().name,
                datos: {
                    residents: doc.ref.collection('propiedades').get().then(snapshot => snapshot.docs.map(doc => doc.data()))
                }
            };
        });

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
            condominioData.datos.residents.then(residents => {
                residents.forEach(resident => {
                    const listItem = document.createElement('li');
                    listItem.textContent = resident.name; // Suponiendo que cada residente tiene un campo 'name'
                    residentsList.appendChild(listItem);
                });
            });
        } else {
            console.error('Elemento #residentsList no encontrado en el DOM.');
        }
    });
}
