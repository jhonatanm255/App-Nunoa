// GENERAR CODIGO NUMERICO DE 4 DIGITOS PARA EXPORTAR LOS DATOS
const btnGenerateCode = document.getElementById('export');
const exportCodeContainer = document.getElementById('exportCodeContainer');
const exportCodeSpan = document.getElementById('exportCode');

btnGenerateCode.addEventListener('click', async () => {
    try {
        const exportCode = generateRandomNumericCode(4); // Generar código numérico de 4 dígitos
        exportCodeSpan.textContent = exportCode; // Mostrar el código generado en el span
        exportCodeContainer.style.display = 'block'; // Mostrar el contenedor

        // Preparar datos para migración similar al escaneo de QR
        const userId = firebase.auth().currentUser.uid;
        const condominioId = 'ID_DEL_CONDOMINIO_A_MIGRAR'; // Reemplazar con el ID del condominio a migrar
        const condominioData = await fetchCondominioData(userId, condominioId);

        if (!condominioData) {
            throw new Error(`No se encontraron datos para el condominio con ID ${condominioId}.`);
        }

        await migrateData(userId, condominioId, condominioData);
    } catch (error) {
        console.error('Error generando código y migrando datos:', error);
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

async function fetchCondominioData(userId, condominioId) {
    try {
        const condominioDocRef = firebase.firestore()
            .collection('users')
            .doc(userId)
            .collection('condominios')
            .doc(condominioId);

        const condominioDocSnapshot = await condominioDocRef.get();

        if (!condominioDocSnapshot.exists) {
            throw new Error(`El condominio con ID ${condominioId} no existe.`);
        }

        return condominioDocSnapshot.data();
    } catch (error) {
        console.error('Error obteniendo datos del condominio:', error);
        return null;
    }
}

async function migrateData(userId, condominioId, condominioData) {
    try {
        const currentUser = firebase.auth().currentUser;

        // Guardar el condominio principal en la cuenta actual
        const newCondominioRef = firebase.firestore()
            .collection('users')
            .doc(currentUser.uid)
            .collection('condominios')
            .doc(condominioId);

        await newCondominioRef.set(condominioData);

        console.log(`Condominio principal añadido correctamente a la cuenta actual.`);

        // Obtener y copiar la subcolección 'propiedades' desde el documento con el nombre del condominio
        const condominioName = condominioData.name;
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

        // Actualizar la interfaz con los datos del nuevo condominio copiado
        const newCondominioData = {
            name: condominioName,
            datos: {
                residents: propiedadesSnapshot.docs.map(doc => doc.data()) // Asumimos que los datos de residentes están en las propiedades
            }
        };

        mostrarDatosCondominioEnInterfaz(newCondominioData);

    } catch (error) {
        console.error(`Error migrando datos: ${error.message}`);
    }
}

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

