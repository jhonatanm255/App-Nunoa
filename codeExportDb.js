// GENERAR CODIGO NUMERICO DE 4 DIGITOS PARA EXPORTAR LOS DATOS
const btnGenerateCode = document.getElementById('export');
const exportCodeContainer = document.getElementById('exportCodeContainer');
const exportCodeSpan = document.getElementById('exportCode');

btnGenerateCode.addEventListener('click', async () => {
    try {
        const exportCode = generateRandomNumericCode(4); // Generar código numérico de 4 dígitos
        exportCodeSpan.textContent = exportCode; // Mostrar el código generado en el span
        exportCodeContainer.style.display = 'block'; // Mostrar el contenedor
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
    const myModal = document.getElementById('myModal');
    myModal.style.display = 'none';

    // Cerrar el Modal al Hacer Clic en el Botón de Cerrar
    const closeBtn = document.querySelector('#container-import .close');
    closeBtn.addEventListener('click', () => {
    const importContent = document.getElementById('container-import');
    importContent.style.display = 'none';
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
// Función para manejar la migración de datos
const handleDataMigration = async (userId) => {
    try {
        const currentUser = firebase.auth().currentUser;
        const batch = firebase.firestore().batch();

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

        // Iterar sobre cada condominio para copiarlo
        await Promise.all(condominiosSnapshot.docs.map(async (doc) => {
            const condominioData = doc.data();
            const condominioId = doc.id;

            // Guardar el condominio principal en la cuenta actual
            const newCondominioRef = firebase.firestore()
                .collection('users')
                .doc(currentUser.uid)
                .collection('condominios')
                .doc(condominioId);

            batch.set(newCondominioRef, condominioData);

            // Obtener y copiar la subcolección 'propiedades' desde el documento original
            const propiedadesSnapshot = await doc.ref.collection('propiedades').get();
            const newPropiedadesRef = newCondominioRef.collection('propiedades');
            propiedadesSnapshot.forEach(propDoc => {
                batch.set(newPropiedadesRef.doc(propDoc.id), propDoc.data());
            });

            // Obtener y copiar la subcolección 'residents' si existe
            const residentsSnapshot = await doc.ref.collection('residents').get();
            const newResidentsRef = newCondominioRef.collection('residents');
            residentsSnapshot.forEach(residentDoc => {
                batch.set(newResidentsRef.doc(residentDoc.id), residentDoc.data());
            });
        }));

        await batch.commit();
        console.log('Datos migrados exitosamente.');

        // Actualizar la interfaz con los datos del nuevo condominio copiado
        const newCondominioData = await Promise.all(condominiosSnapshot.docs.map(async (doc) => {
            const condominioName = doc.data().name;
            const propiedadesSnapshot = await doc.ref.collection('propiedades').get();
            const residentesSnapshot = await doc.ref.collection('residents').get();
            const residents = residentesSnapshot.docs.map(doc => doc.data());
            return {
                name: condominioName,
                datos: {
                    residents: residents
                }
            };
        }));

        mostrarDatosCondominioEnInterfaz(newCondominioData);
    } catch (error) {
        console.error('Error en la migración de datos:', error.message);
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
