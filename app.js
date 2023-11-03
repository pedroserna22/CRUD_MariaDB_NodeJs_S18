// Importación de módulos
const express = require("express"); // Importa el módulo Express para crear el servidor
const mariadb = require("mariadb");  // Importa el módulo mariadb para interactuar con la base de datos

// Configuración de la piscina de conexiones a la base de datos
const pool = mariadb.createPool({
  host: "localhost",               // Host de la base de datos
  user: "root",                    // Nombre de usuario
  password: "1234",                // Contraseña
  database: "planning",            // Nombre de la base de datos
  connectionLimit: 5,              // Límite de conexiones simultáneas
});

// Configuración del servidor Express
const app = express();             // Crea una instancia de Express
const port = 4000;                 // Establece el puerto del servidor en 4000 ya que me decia que el 3000 estaba en uso

app.use(express.json());            // Habilita el análisis de solicitudes en formato JSON

// Definición de rutas y controladores
app.get("/", (req, res) => {
  res.send("<h1>Bienvenid@ al servidor</h1>"); // Ruta raíz, devuelve un mensaje de bienvenida
});

app.get("/planning", async (req, res) => {
  // Ruta para obtener todas las tareas
  let conn;
  try {
    conn = await pool.getConnection();  // Obtiene una conexión de la piscina
    const rows = await conn.query(
      "SELECT id, name, description, created_at, updated_at, status FROM planning"
    );                                  // Consulta la base de datos para obtener las tareas
    res.json(rows);                     // Devuelve las tareas como respuesta en formato JSON
  } catch (error) {
    res.status(500).json({ message: "Se rompió el servidor" }); // En caso de error, devuelve un mensaje de error
  } finally {
    if (conn) conn.release();          // Libera la conexión a la base de datos
  }
});

app.post("/planning", async (req, res) => {
  // Ruta para crear una nueva tarea
  let conn;
  try {
    conn = await pool.getConnection();  // Obtiene una conexión de la piscina
    const response = await conn.query(
      `INSERT INTO planning(name, description, created_at, updated_at, status) VALUES (?, ?, NOW(), NOW(), ?)`,
      [req.body.name, req.body.description, req.body.status]
    );                                  // Inserta una nueva tarea en la base de datos
    res.json({ id: parseInt(response.insertId), ...req.body }); // Devuelve la tarea creada como respuesta en formato JSON
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Se rompió el servidor" }); // En caso de error, devuelve un mensaje de error
  } finally {
    if (conn) conn.release();          // Libera la conexión a la base de datos
  }
});

app.put("/planning/:id", async (req, res) => {
  // Ruta para actualizar una tarea por su ID
  let conn;
  try {
    conn = await pool.getConnection();  // Obtiene una conexión de la piscina
    const response = await conn.query(
      `UPDATE planning SET name=?, description=?, updated_at=NOW(), status=? WHERE id=?`,
      [req.body.name, req.body.description, req.body.status, req.params.id]
    );                                  // Actualiza una tarea en la base de datos
    res.json({ id: req.params.id, ...req.body }); // Devuelve la tarea actualizada como respuesta en formato JSON
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Se rompió el servidor" }); // En caso de error, devuelve un mensaje de error
  } finally {
    if (conn) conn.release();          // Libera la conexión a la base de datos
  }
});

app.delete("/planning/:id", async (req, res) => {
  // Ruta para eliminar una tarea por su ID
  let conn;
  try {
    conn = await pool.getConnection();  // Obtiene una conexión de la piscina
    const rows = await conn.query("DELETE FROM planning WHERE id=?", [req.params.id]);
    res.json({ message: "Tarea eliminada correctamente" }); // Devuelve un mensaje de confirmación de eliminación
  } catch (error) {
    res.status(500).json({ message: "Se rompió el servidor" }); // En caso de error, devuelve un mensaje de error
  } finally {
    if (conn) conn.release();          // Libera la conexión a la base de datos
  }
});

// Inicio del servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`); // Inicia el servidor en el puerto especificado y muestra un mensaje en la consola
});

/*
SCRIPT BASE DE DATOS:

CREATE TABLE `planning` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`name` VARCHAR(50) NOT NULL,
	`description` VARCHAR(50) NOT NULL,
	`created_at` DATE NOT NULL,
	`updated_at` DATE NOT NULL,
	`status` VARCHAR(50) NOT NULL,
	PRIMARY KEY (`id`) USING BTREE
)
COLLATE='latin1_swedish_ci'
ENGINE=InnoDB
AUTO_INCREMENT=3
;

*/ 