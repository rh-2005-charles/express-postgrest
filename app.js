// Importar express y pg
require('dotenv').config();

const express = require('express');
const { Client } = require('pg');
const path = require('path');

// Crear la instancia de Express
const app = express();

app.use(express.json());

// Crear la configuración de la conexión con PostgreSQL
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

// Conectar a la base de datos
client.connect()
  .then(() => console.log('Conectado a la base de datos PostgreSQL'))
  .catch((err) => console.error('Error de conexión a la base de datos', err));

// Configurar el motor de plantillas para servir el archivo HTML
app.use(express.static(path.join(__dirname, 'views')));

// Ruta para la página principal que servirá el HTML con la tabla
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Ruta para obtener todas las tareas o filtradas por búsqueda
app.get('/tbl_tareas', async (req, res) => {
  try {
    const searchTerm = req.query.search || '';
    const result = await client.query('SELECT * FROM tbl_tareas WHERE titulo ILIKE $1', [`%${searchTerm}%`]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al consultar las tareas', err);
    res.status(500).send('Error al consultar las tareas');
  }
});

// Ruta para obtener una tarea por ID
app.get('/tbl_tareas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('SELECT * FROM tbl_tareas WHERE id = $1', [id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al obtener la tarea', err);
    res.status(500).send('Error al obtener la tarea');
  }
});

// Ruta para crear una nueva tarea
app.post('/tbl_tareas', async (req, res) => {
  const { titulo, descripcion } = req.body;
  
  try {
    // Insertar la nueva tarea en la base de datos
    const result = await client.query(
      'INSERT INTO tbl_tareas (titulo, descripcion) VALUES ($1, $2) RETURNING *',
      [titulo, descripcion]
    );
    
    const tareaCreada = result.rows[0]; // Tarea recién creada
    res.json(tareaCreada);  // Devolver la tarea recién creada al cliente
  } catch (err) {
    console.error('Error al crear la tarea', err);
    res.status(500).send('Error al crear la tarea');
  }
});



// Ruta para actualizar una tarea
app.put('/tbl_tareas/:id', async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion } = req.body;
  try {
    const result = await client.query(
      'UPDATE tbl_tareas SET titulo = $1, descripcion = $2 WHERE id = $3',
      [titulo, descripcion, id]
    );
    res.json({ message: 'Tarea actualizada' });
  } catch (err) {
    console.error('Error al actualizar la tarea', err);
    res.status(500).send('Error al actualizar la tarea');
  }
});



// Ruta para eliminar una tarea
app.delete('/tbl_tareas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('DELETE FROM tbl_tareas WHERE id = $1', [id]);
    res.json({ message: 'Tarea eliminada' });
  } catch (err) {
    console.error('Error al eliminar la tarea', err);
    res.status(500).send('Error al eliminar la tarea');
  }
});

// Configurar el puerto en el que escuchará el servidor
const port = 3000;
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

// Cerrar la conexión cuando el servidor se detiene
process.on('SIGINT', async () => {
    await client.end();
    console.log('Conexión cerrada');
    process.exit();
});
