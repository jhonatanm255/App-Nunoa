const handleQRScan = async (data) => {
    try {
        // Verificar si 'data' es una cadena JSON válida
        if (!data) {
            throw new Error('Los datos del QR están vacíos o no son válidos.');
        }

        // Intentar parsear el JSON
        let parsedData;
        try {
            parsedData = JSON.parse(data);
        } catch (e) {
            throw new Error('Error al parsear los datos del QR: ' + e.message);
        }

        // Destructurar los datos del JSON parseado
        const { userId, condominioId, condominioData } = parsedData;
        if (!userId || !condominioId || !condominioData || !condominioData.name) {
            throw new Error('El JSON parseado no contiene los campos esperados.');
        }
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

        // Actualizar la interfaz con los datos del nuevo condominio copiado
        const newCondominioData = {
            name: condominioName,
            datos: {
                residents: propiedadesSnapshot.docs.map(doc => doc.data()) // Asumimos que los datos de residentes están en las propiedades
            }
        };

        mostrarDatosCondominioEnInterfaz(newCondominioData);

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


document.getElementById('closeExportCodeContainer').addEventListener('click', function() {
    document.getElementById('exportCodeContainer').style.display = 'none'; // Ocultar el contenedor
});


