const express = require('express');
const path = require('path');
const { db } = require('./firebase-config'); // Importa la configuración de Firebase

const app = express();
const port = 8091;

// Middleware para parsear JSON
app.use(express.json());

//app.get('/', (req, res) => {
  //res.send('Microservicio Alimentación');
//}); prueba a quitar

// Servir archivos estáticos
app.use(express.static(path.join(__dirname))); // Esto servirá tu archivo index.html

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); // Sirve el archivo HTML
});

// Obtener la lista de alimentos
app.get('/lista-alimentos', async (req, res) => {
  try {
    const alimentos = await db.collection('alimentacion').get();
    const items = alimentos.docs.map(doc => ({ id: doc.id, ...doc.data() })); // Incluye ID del documento
    res.status(200).json({ data: { items } });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los datos', error: error.message });
  }
});

// Agregar un nuevo alimento
app.post('/agregar-alimento', async (req, res) => {
    try {
        const nuevoAlimento = req.body; // El cuerpo de la solicitud debe contener los datos del alimento
        const existing = await db.collection('alimentacion').doc(nuevoAlimento.id).get();
        if (existing.exists) {
            return res.status(400).json({ message: 'ID personalizado ya existe' });
        }
        await db.collection('alimentacion').doc(nuevoAlimento.id).set(nuevoAlimento);
        res.status(201).json(nuevoAlimento);
    } catch (error) {
        res.status(500).json({ message: 'Error al agregar el alimento', error: error.message });
    }
});


// Actualizar un alimento
app.put('/actualizar-alimento/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const datosActualizados = req.body;

        const alimentoRef = db.collection('alimentacion').doc(id);
        const alimento = await alimentoRef.get();
        if (!alimento.exists) {
            return res.status(404).json({ message: 'Alimento no encontrado' });
        }

        await alimentoRef.update(datosActualizados);
        res.status(200).json({ message: 'Alimento actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el alimento', error: error.message });
    }
});



// Eliminar un alimento
app.delete('/eliminar-alimento/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const alimentoRef = db.collection('alimentacion').doc(id);
        const alimento = await alimentoRef.get();
        if (!alimento.exists) {
            return res.status(404).json({ message: 'Alimento no encontrado' });
        }

        await alimentoRef.delete();
        res.status(200).json({ message: 'Alimento eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el alimento', error: error.message });
    }
});



app.listen(port, () => {
  console.log('Microservicio Alimentación escuchando en localhost:' + port);
});
