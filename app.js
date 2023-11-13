const express = require('express')
const url = require('url')
const { v4: uuidv4 } = require('uuid')
const database = require('./utilsMySQL.js')
const app = express()
const port = 3000

// Crear i configurar l'objecte de la base de dades
var db = new database()
db.init({
host: "localhost",
port: 3307,
user: "root",
password: "pwd",
database: "world"
})

// Publicar arxius carpeta ‘public’
app.use(express.static('public'))

// Configurar per rebre dades POST en format JSON
app.use(express.json());

// Configurar direcció '/testDB'
app.get('/', testDB)
async function testDB (req, res) {
let rst = await db.query('SELECT * FROM usuarios')
res.send(rst)
}

// Configurar la direcció '/ajaxCall'
app.post('/ajaxCall', ajaxCall)
async function ajaxCall (req, res) {
    let objPost = req.body;
    let result = ""

    // Simulate delay (1 second)
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (objPost.callType == 'tableData') {
        try {
            let qry = `SELECT * FROM ${objPost.table}`
            result = await db.query(qry)
        } catch (e) {
            console.error('Error at "ajaxCall":', e)
        }
    }
    res.send(result)
}

// Configurar la direcció '/getTables'
app.get('/getTables', (req, res) => {
    db.query('SHOW TABLES', (err, result) => {
      if (err) {
        console.error('Error al obtener las tablas:', err);
        res.status(500).send('Error interno del servidor');
        return;
      }
  
      const tables = result.map(table => table.Tables_in_usuarios);
      res.json(tables);
    });
});

app.post('/addData', (req, res) => {
    let objPost = req.body;

    const sql = `INSERT INTO usuarios (nom, mail) VALUES ('${objPost.nombre}', ${objPost.edad})`;

    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error al añadir datos:', err);
            res.status(500).send('Error interno del servidor');
            return;
        } else {
            return;
        }
    });
});

app.post('/updateData', updateData);
async function updateData(req, res) {
    const { id, nuevoNombre, nuevaEdad } = req.body;

    try {
        // Ejemplo de actualización en una base de datos MySQL
        const sql = `UPDATE usuarios SET nom = '${nuevoNombre}', mail = '${nuevaEdad}' WHERE id = '${id}'`;
        await db.query(sql, [nuevoNombre, nuevaEdad, id]);

        res.status(200).send({ success: true, message: 'Datos modificados con éxito' });
    } catch (error) {
        console.error('Error al actualizar datos:', error);
        res.status(500).send({ success: false, message: 'Error interno del servidor' });
    }
}

app.post('/deleteData', deleteData);
async function deleteData(req, res) {
    let objPost = req.body;

    const id = objPost.id;

    const sql = `DELETE FROM usuarios WHERE id = '${id}'`;

    await db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error al borrar datos:', err);
            return res.status(500).send('Error interno del servidor');
        }

        res.send(result);
    });
}


// Activar el servidor
const httpServer = app.listen(port, appListen)
function appListen () {
console.log(`Example app listening on: http://localhost:${port}`)
}

// Close connections when process is killed
process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);
function shutDown() {
console.log('Shutting down gracefully');
httpServer.close()
db.end()
process.exit(0);
}