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
const handleDataMigration = async (userId) => {
    try {
        const currentUser = firebase.auth().currentUser;

        // Obtener todos los condominios del usuario origen
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

        // Iterar sobre cada condominio para copiar ambas subcolecciones
        await Promise.all(condominiosSnapshot.docs.map(async (doc) => {
            const condominioData = doc.data();
            const condominioId = doc.id;

            // Copiar el documento principal (por ID)
            const newCondominioRef = firebase.firestore()
                .collection('users')
                .doc(currentUser.uid)
                .collection('condominios')
                .doc(condominioId);

            batch.set(newCondominioRef, condominioData);

            // Obtener y copiar la subcolección 'propiedades' (por ID)
            const propiedadesSnapshot = await doc.ref.collection('propiedades').get();
            const newPropiedadesRef = newCondominioRef.collection('propiedades');
            propiedadesSnapshot.forEach(propDoc => {
                batch.set(newPropiedadesRef.doc(propDoc.id), propDoc.data());
            });

            // Ahora copiar la subcolección basada en el nombre del condominio
            const nombreCondominio = condominioData.name;
            const condominioNombreRef = firebase.firestore()
                .collection('users')
                .doc(currentUser.uid)
                .collection('condominios')
                .doc(nombreCondominio);

            batch.set(condominioNombreRef, condominioData);

            // Copiar la subcolección 'propiedades' también desde este documento
            const propiedadesNombreSnapshot = await doc.ref.collection('propiedades').get();
            const newPropiedadesNombreRef = condominioNombreRef.collection('propiedades');
            propiedadesNombreSnapshot.forEach(propDoc => {
                batch.set(newPropiedadesNombreRef.doc(propDoc.id), propDoc.data());
            });
        }));

        await batch.commit();
        console.log('Datos migrados exitosamente.');
    } catch (error) {
        console.error('Error en la migración de datos:', error);
    }
};

// MOSTRAR DATOS DEL CONDOMINIO EN LA INTERFAZ
function mostrarDatosCondominioEnInterfaz(condominios) {
    const opcionesSelect = document.getElementById('opciones');
    const residentsList = document.getElementById('residentsList');

    if (!opcionesSelect) {
        console.error('Elemento #opciones no encontrado en el DOM.');
        return;
    }
    if (!residentsList) {
        console.error('Elemento #residentsList no encontrado en el DOM.');
        return;
    }

    // Limpiar el select y la lista de residentes
    opcionesSelect.innerHTML = '';
    residentsList.innerHTML = '';

    condominios.forEach(condominioData => {
        const option = document.createElement('option');
        option.value = condominioData.name;
        option.textContent = condominioData.name;
        opcionesSelect.appendChild(option);

        // Mostrar residentes
        condominioData.datos.residents.forEach(resident => {
            const listItem = document.createElement('li');
            listItem.textContent = resident.name; // Suponiendo que cada residente tiene un campo 'name'
            residentsList.appendChild(listItem);
        });
    });
}

