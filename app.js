const express = require("express");
const url = require("url");
const { v4: uuidv4 } = require("uuid");
const database = require("./utilsMySQL.js");
const app = express();
const port = 3007;

// Crear i configurar l'objecte de la base de dades
var db = new database();
db.init({
  host: "localhost",
  port: 3307,
  user: "root",
  password: "pwd",
  database: "world"
  })


// Publicar arxius carpeta 'public'
app.use(express.static("public"));

// Configurar per rebre dades POST en format JSON
app.use(express.json());

// Configurar direcció '/testDB'
app.get("/", testDB);
async function testDB(req, res) {
  let rst = await db.query("SELECT * FROM usuarios");
  res.send(rst);
}

// Configurar la direcció '/ajaxCall'
app.post("/ajaxCall", ajaxCall);
async function ajaxCall(req, res) {
  let objPost = req.body;
  let result = "";

  // Simulate delay (1 second)
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (objPost.callType == "tableData") {
    try {
      let qry = `SELECT * FROM ${objPost.table}`;
      result = await db.query(qry);
    } catch (e) {
      console.error('Error at "ajaxCall":', e);
    }
  }
  res.send(result);
}

// Configurar la direcció '/getTables'
app.get("/getTables", (req, res) => {
  db.query("SHOW TABLES", (err, result) => {
    if (err) {
      console.error("Error al obtener las tablas:", err);
      res.status(500).send("Error interno del servidor");
      return;
    }

    const tables = result.map((table) => table.Tables_in_usuarios);
    res.json(tables);
  });
});

app.post("/addData", addData);

async function addData(req, res) {
  const { nom, mail } = req.body;

  try {
    // Verificar si la tabla está vacía antes de reiniciar AUTO_INCREMENT
    const checkEmptyTable = `SELECT COUNT(*) AS rowCount FROM usuarios`;
    const result = await db.query(checkEmptyTable);
    const rowCount = result[0].rowCount;

    if (rowCount === 0) {
      // Si la tabla está vacía, reiniciar AUTO_INCREMENT
      const resetAutoIncrement = `ALTER TABLE usuarios AUTO_INCREMENT = 1`;
      await db.query(resetAutoIncrement);
    }

    // Ejemplo de inserción en una base de datos MySQL
    const sql = `INSERT INTO usuarios (nom, mail) VALUES ('${nom}', '${mail}')`;

    // Objeto con los valores correspondientes
    const values = { $nom: nom, $mail: mail };

    await db.query(sql, values);
    res.json({ success: true, message: "Datos añadidos con éxito" });
  } catch (error) {
    console.error("Error al agregar datos:", error);
    res
      .status(500)
      .send({ success: false, message: "Error interno del servidor" });
  }
}


app.post("/updateData", updateData);
async function updateData(req, res) {
  const { id, nuevonom, nuevamail } = req.body;

  try {
    // Ejemplo de actualización en una base de datos MySQL
    const sql = `UPDATE usuarios SET nom = '${nuevonom}', mail = '${nuevamail}' WHERE id = '${id}'`;
    await db.query(sql, [nuevonom, nuevamail, id]);

    res
      .status(200)
      .send({ success: true, message: "Datos modificados con éxito" });
  } catch (error) {
    console.error("Error al actualizar datos:", error);
    res
      .status(500)
      .send({ success: false, message: "Error interno del servidor" });
  }
}

app.post("/deleteData", deleteData);
async function deleteData(req, res) {
   const {deleteid} = req.body;


 

  try {
    // Ejemplo de inserción en una base de datos MySQL
    const sql = `DELETE FROM usuarios WHERE id = ${deleteid} `;

    // Objeto con las variables y sus valores correspondientes

    await db.query(sql, [deleteid]);
    res.json({ success: true, message: "Datos añadidos con éxito" });
  } catch (error) {
    console.error("Error al agregar datos:", error);
    res
      .status(500)
      .send({ success: false, message: "Error interno del servidor" });
  }
}

app.post("/createTable", createTable);

async function createTable(req, res) {
  const { tableName, columns } = req.body;

  try {
    if (!tableName || !columns || columns.length === 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Datos insuficientes para crear la tabla",
        });
    }

    // Validar tipos de columna permitidos (puedes personalizar esto según tus necesidades)
    const allowedColumnTypes = ["INT", "VARCHAR(255)", "TEXT", "DATE"];
    const isValidColumnType = columns.every((column) =>
      allowedColumnTypes.includes(column.type.toUpperCase())
    );

    if (!isValidColumnType) {
      return res
        .status(400)
        .json({ success: false, message: "Tipo de columna no válido" });
    }

    // Escapar nombres de tabla y columnas (ajusta según la biblioteca que estés utilizando)
    const escapedTableName = escapeIdentifier(tableName);
    const escapedColumns = columns
      .map((column) => `${escapeIdentifier(column.name)} ${column.type}`)
      .join(", ");

    // Ejemplo de creación de una tabla en una base de datos MySQL
    const sql = `CREATE TABLE IF NOT EXISTS ${escapedTableName} (
            id INT AUTO_INCREMENT PRIMARY KEY,
            ${escapedColumns}
        )`;

    await db.query(sql);
    res.json({ success: true, message: "Tabla creada con éxito" });
  } catch (error) {
    console.error("Error al crear la tabla:", error);
    res
      .status(500)
      .json({ success: false, message: "Error interno del servidor" });
  }
}

// Función de escape de identificadores (ajusta según la biblioteca que estés utilizando)
function escapeIdentifier(identifier) {
  // Implementa la lógica de escape aquí
  // Por ejemplo, puedes usar backticks para MySQL
  return `\`${identifier}\``;
}

app.post("/updateTable", updateTable);

async function updateTable(req, res) {
  const { tableName, columnName, columnType, operationSelect } = req.body; // Added columnType to capture the type of the new column
  console.log("Consola---->" + tableName + columnName+operationSelect);

  try {
    // Ejemplo de actualización en una base de datos MySQL
    if (operationSelect == 'add') {
      const addColumnSQL = `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType}`;
      await db.query(addColumnSQL, [tableName, columnName, columnType]);
    } else {
      const dropColumnSQL = `ALTER TABLE ${tableName} DROP COLUMN ${columnName}`;
      await db.query(dropColumnSQL, [tableName, columnName]);
    }

    // Nueva consulta para agregar la columna
    res
      .status(200)
      .send({ success: true, message: "Datos modificados con éxito" });
  } catch (error) {
    console.error("Error al actualizar datos:", error);
    res
      .status(500)
      .send({ success: false, message: "Error interno del servidor" });
  }
}
app.post("/deleteTable",deleteTable);
    async function deleteTable(req,res){
        const {tableName} =req.body;

        try {
            // Ejemplo de inserción en una base de datos MySQL
            const sql = `DROP TABLE ${tableName}`;
        
            // Objeto con las variables y sus valores correspondientes
        
            await db.query(sql, [tableName]);
            res.json({ success: true, message: "Datos añadidos con éxito" });
          } catch (error) {
            console.error("Error al agregar datos:", error);
            res
              .status(500)
              .send({ success: false, message: "Error interno del servidor" });
          }
        
    }



// Activar el servidor
const httpServer = app.listen(port, appListen);
function appListen() {
  console.log(`Example app listening on: http://localhost:${port}`);
}

// Close connections when process is killed
process.on("SIGTERM", shutDown);
process.on("SIGINT", shutDown);
function shutDown() {
  console.log("Shutting down gracefully");
  httpServer.close();
  db.end();
  process.exit(0);
}