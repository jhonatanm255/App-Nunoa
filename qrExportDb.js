
      // Función para iniciar la cámara y leer códigos QR
      const video = document.getElementById('video');
      const canvas = document.getElementById('canvas');
      const startButton = document.getElementById('startButton');
      const context = canvas.getContext('2d');
      
      startButton.addEventListener('click', async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } // Acceder a la cámara trasera
          });
          video.srcObject = stream;
          video.play(); // Iniciar la reproducción del video automáticamente
      
          // Esperar a que se cargue el video
          video.addEventListener('loadedmetadata', () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
          });
      
          video.addEventListener('play', () => {
            console.log('Video is playing');
            setInterval(() => {
              context.drawImage(video, 0, 0, canvas.width, canvas.height);
              const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
              const code = jsQR(imageData.data, imageData.width, imageData.height);
              if (code) {
                console.log('Found QR code', code.data);
              }
            }, 100);
          });
        } catch (error) {
          console.error('Error accessing the camera:', error);
        }
      });
      


    function exportarDatosCondominio(condominioId) {
        const userId = firebase.auth().currentUser.uid;
        const db = firebase.firestore();
        const docRef = db.collection('usuarios').doc(userId).collection('condominios').doc(condominioId).collection('propiedades');
        
        docRef.get().then((querySnapshot) => {
          const data = [];
          querySnapshot.forEach((doc) => {
            data.push(doc.data());
          });
          const json = JSON.stringify(data);
          descargarArchivo(json, 'datos_condominio.json');
        });
      }
      
      function descargarArchivo(contenido, nombreArchivo) {
        const a = document.createElement('a');
        const archivo = new Blob([contenido], { type: 'application/json' });
        a.href = URL.createObjectURL(archivo);
        a.download = nombreArchivo;
        a.click();
      }
       
      

   