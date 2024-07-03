// Agregar event listener al botón de eliminar condominio
const deleteButton = document.querySelector('.delete');
deleteButton.addEventListener('click', async () => {
    const nombreCondominio = document.getElementById('opciones').value;
    if (!nombreCondominio) {
        console.error('Por favor seleccione un condominio para eliminar.');
        return;
    }

    const user = firebase.auth().currentUser;
    if (user) {
        const userId = user.uid;

        try {
            // Obtener la referencia al documento del condominio a eliminar
            const condominiosRef = firebase.firestore().collection('users').doc(userId).collection('condominios');
            const querySnapshot = await condominiosRef.where('name', '==', nombreCondominio).get();

            if (!querySnapshot.empty) {
                const condominioId = querySnapshot.docs[0].id;
                const condominioRef = firebase.firestore().collection('users').doc(userId).collection('condominios').doc(condominioId);

                // Eliminar el condominio
                await condominioRef.delete();
                console.log(`Condominio '${nombreCondominio}' eliminado correctamente.`);

                // Actualizar la interfaz después de la eliminación (opcional)
                // Aquí puedes limpiar la interfaz o hacer cualquier otro ajuste necesario
                limpiarInterfaz();

                const modal = document.getElementById('myModal');
                modal.style.display = 'none'

            } else {
                console.error(`No se encontró el condominio '${nombreCondominio}' para eliminar.`);
            }
        } catch (error) {
            console.error('Error al intentar eliminar el condominio:', error);
        }
    } else {
        console.error('No hay usuario autenticado.');
    }
});

// Función opcional para limpiar la interfaz después de eliminar el condominio
function limpiarInterfaz() {
    // Limpiar la lista de residentes
    const residentsList = document.getElementById('residentsList');
    if (residentsList) {
        residentsList.innerHTML = ''; // Limpiar la lista de residentes
    } else {
        console.error('Elemento #residentsList no encontrado en el DOM.');
    }

    // Remover la opción del condominio eliminado del selector
    const opcionesSelect = document.getElementById('opciones');
    if (opcionesSelect) {
        const nombreCondominio = opcionesSelect.value;
        const options = opcionesSelect.options;

        for (let i = 0; i < options.length; i++) {
            if (options[i].value === nombreCondominio) {
                opcionesSelect.remove(i); // Remover la opción del condominio eliminado
                break;
            }
        }

        // Resetear el selector a la primera opción si hay más opciones disponibles
        if (options.length > 0) {
            opcionesSelect.selectedIndex = 0;
        }

        console.log(`Interfaz actualizada después de eliminar el condominio '${nombreCondominio}'.`);
    } else {
        console.error('Elemento #opciones no encontrado en el DOM.');
    }
}