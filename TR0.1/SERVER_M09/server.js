// Importar las bibliotecas necesarias
const express = require('express'); // Express es un marco de trabajo para crear aplicaciones web en Node.js.
const bodyParser = require('body-parser'); // Body-parser permite manejar cuerpos de solicitudes HTTP en diferentes formatos, en este caso JSON.
const fs = require('fs'); // El módulo fs permite interactuar con el sistema de archivos, permitiendo leer y escribir archivos.
const cors = require('cors'); // CORS (Cross-Origin Resource Sharing) es un mecanismo que permite a los recursos ser solicitados desde un dominio diferente al que los sirvió.

const app = express(); // Crear una instancia de la aplicación Express, que se utilizará para definir rutas y middleware.
const port = 3000; // Definir el puerto en el que se ejecutará el servidor. En este caso, el puerto 3000.


// Habilitar CORS para permitir solicitudes de otros orígenes
app.use(cors()); // Usa el middleware CORS, lo que permite que el servidor acepte solicitudes desde diferentes dominios.


// Middleware para parsear el cuerpo de las solicitudes en formato JSON
app.use(bodyParser.json()); // Configura el middleware para que convierta automáticamente los cuerpos de las solicitudes JSON en objetos JavaScript accesibles a través de req.body.


// Ruta para obtener todas las preguntas (Read)
app.get('/preguntes', (req, res) => {
    // Al recibir una solicitud GET en la ruta /preguntes, se ejecuta la siguiente función.
    fs.readFile('preguntes.json', 'utf-8', (err, data) => {
        // Intenta leer el archivo 'preguntes.json'.
        if (err) {
            // Si hay un error, devuelve un estado 500 (Error interno del servidor) con un mensaje de error.
            return res.status(500).send('Error leyendo el archivo');
        }
        // Si la lectura fue exitosa, parsea el contenido del archivo JSON y lo envía como respuesta.
        res.send(JSON.parse(data));
    });
});


// Ruta para crear una nueva pregunta (Create)
app.post('/preguntes', (req, res) => {
    // Al recibir una solicitud POST en la ruta /preguntes, se ejecuta la siguiente función.
    const nuevaPregunta = req.body; // Obtiene la nueva pregunta del cuerpo de la solicitud, que debe ser un objeto JSON.

    fs.readFile('preguntes.json', 'utf-8', (err, data) => {
        // Intenta leer el archivo 'preguntes.json'.
        if (err) {
            // Manejar errores en caso de que no se pueda leer el archivo.
            return res.status(500).send('Error leyendo el archivo');
        }

        const preguntas = JSON.parse(data); // Parsear las preguntas existentes desde el archivo JSON.
        preguntas.preguntes.push(nuevaPregunta); // Agregar la nueva pregunta al array de preguntas.

        // Escribir el array de preguntas actualizado de vuelta en el archivo.
        fs.writeFile('preguntes.json', JSON.stringify(preguntas, null, 2), (err) => {
            // Manejar errores al escribir el archivo.
            if (err) {
                return res.status(500).send('Error escribiendo el archivo');
            }
            // Enviar una respuesta de éxito al cliente.
            res.send('Pregunta creada correctamente');
        });
    });
});


// Ruta para actualizar una pregunta específica (Update)
app.put('/preguntes/:id', (req, res) => {
    // Al recibir una solicitud PUT en la ruta /preguntes/:id, se ejecuta la siguiente función.
    const id = parseInt(req.params.id); // Obtener el ID de la pregunta desde la URL y convertirlo a un entero.
    const preguntaActualizada = req.body; // Obtener los datos de la pregunta actualizada del cuerpo de la solicitud.

    fs.readFile('preguntes.json', 'utf-8', (err, data) => {
        // Intenta leer el archivo 'preguntes.json'.
        if (err) {
            return res.status(500).send('Error leyendo el archivo'); // Manejar errores al leer el archivo.
        }

        const preguntas = JSON.parse(data); // Parsear las preguntas existentes desde el archivo JSON.
        if (preguntas.preguntes[id]) {
            // Verificar si la pregunta con el ID proporcionado existe.
            preguntas.preguntes[id] = preguntaActualizada; // Actualizar la pregunta con los nuevos datos.
        } else {
            // Si la pregunta no existe, devolver un estado 404 (No encontrado) con un mensaje.
            return res.status(404).send('Pregunta no encontrada');
        }

        // Escribir el array de preguntas actualizado de vuelta en el archivo.
        fs.writeFile('preguntes.json', JSON.stringify(preguntas, null, 2), (err) => {
            // Manejar errores al escribir el archivo.
            if (err) {
                return res.status(500).send('Error escribiendo el archivo');
            }
            // Enviar una respuesta de éxito al cliente.
            res.send('Pregunta actualizada correctamente');
        });
    });
});


// Ruta para eliminar una pregunta específica (Delete)
app.delete('/preguntes/:id', (req, res) => {
    // Al recibir una solicitud DELETE en la ruta /preguntes/:id, se ejecuta la siguiente función.
    const id = parseInt(req.params.id); // Obtener el ID de la pregunta desde la URL y convertirlo a un entero.

    fs.readFile('preguntes.json', 'utf-8', (err, data) => {
        // Intenta leer el archivo 'preguntes.json'.
        if (err) {
            return res.status(500).send('Error leyendo el archivo'); // Manejar errores al leer el archivo.
        }

        const preguntas = JSON.parse(data); // Parsear las preguntas existentes desde el archivo JSON.
        if (preguntas.preguntes[id]) {
            // Verificar si la pregunta con el ID proporcionado existe.
            preguntas.preguntes.splice(id, 1); // Eliminar la pregunta del array.
        } else {
            // Si la pregunta no existe, devolver un estado 404 (No encontrado) con un mensaje.
            return res.status(404).send('Pregunta no encontrada');
        }

        // Escribir el array de preguntas actualizado de vuelta en el archivo.
        fs.writeFile('preguntes.json', JSON.stringify(preguntas, null, 2), (err) => {
            // Manejar errores al escribir el archivo.
            if (err) {
                return res.status(500).send('Error escribiendo el archivo');
            }
            // Enviar una respuesta de éxito al cliente.
            res.send('Pregunta eliminada correctamente');
        });
    });
});


// Iniciar el servidor
app.listen(port, () => {
    // Al iniciar el servidor, mostrar un mensaje en la consola con la dirección en la que está escuchando.
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
