const express = require("express");
const crypto = require('crypto');
const url = require("url");
const { v4: uuidv4 } = require("uuid");
const database = require("./utilsMySQL.js");
const shadowsObj = require('./utilsShadows.js');
const app = express();
const port = 3000;

// Crear i configurar l'objecte de la base de dades
var db = new database();
db.init({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "12345",
  database: "world"
  })


// Publicar arxius carpeta 'public'
app.use(express.static("public"));

// Configurar per rebre dades POST en format JSON
app.use(express.json());
let shadows = new shadowsObj()

// Configurar direcció '/testDB'
app.get("/", testDB);
async function testDB(req, res) {
  let rst = await db.query("SELECT * FROM usuarios");
  res.send(rst);
}

// Configurar la direcció '/ajaxCall'
app.post('/ajaxCall', ajaxCall)
async function ajaxCall(req, res) {
    try {
      let objPost = req.body;
      let result = "";
  
      // Simulate delay (1 second)
      await new Promise((resolve) => setTimeout(resolve, 1000));
  
      switch (objPost.callType) {
        case "actionCheckUserByToken":
          result = await actionCheckUserByToken(objPost);
          break;
        case "actionLogout":
          result = await actionLogout(objPost);
          break;
        case "actionLogin":
          result = await actionLogin(objPost);
          break;
        case "actionSignUp":
          result = await actionSignUp(objPost);
          break;
        case "tableData":
          let qry = `SELECT * FROM ${objPost.table}`;
          result = await db.query(qry);
          break;
        default:
          result = { result: "KO", message: "Invalid callType" };
          break;
      }
  
      res.send(result);
    } catch (error) {
      console.error('Error at "ajaxCall":', error);
      res.status(500).send({ result: "KO", message: "Internal Server Error" });
    }
  }
  
  

// Configurar la direcció '/getTables'
//app.get("/getTables", (req, res) =>

app.post("/getTables", getTables);

async function getTables(req, res){
  db.query("SHOW TABLES", (err, result) => {
    if (err) {
      console.error("Error al obtener las tablas:", err);
      res.status(500).send("Error interno del servidor");
      return;
    }

    const tables = result.map((table) => table[`Tables_in_${db.config.database}`]);
    res.json(tables);
  });
};

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
const httpServer = app.listen(port, appListen)
async function appListen () {
  await shadows.init('./public/index.html', './public/shadows')
  console.log(`Example app listening on: http://localhost:${port}`)
  console.log(`Development queries on: http://localhost:${port}/index-dev.html`)
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
app.get('/index-dev.html', getIndexDev)
async function getIndexDev (req, res) {
  res.setHeader('Content-Type', 'text/html');
  res.send(shadows.getIndexDev())
}

// Configurar la direcció '/shadows.js' per retornar
// tot el codi de les shadows en un sol arxiu
app.get('/shadows.js', getShadows)
async function getShadows (req, res) {
  res.setHeader('Content-Type', 'application/javascript');
  res.send(shadows.getShadows())
}

// Configurar la direcció '/ajaxCall'

async function actionCheckUserByToken(objPost) {
    try {
      const { token } = objPost;
  
      // Buscar el usuario en la base de datos por el token
      const selectQuery = `SELECT nom AS userName FROM usuarios WHERE token = '${token}'`;
  
      const result = await db.query(selectQuery);
  
      if (result.length === 0) {
        return { result: "KO" };
      } else {
        return { result: "OK", userName: result[0].userName };
      }
    } catch (error) {
      console.error('Error at "actionCheckUserByToken":', error);
      return { result: "KO", message: "Error al verificar el usuario por token" };
    }
  }
  

  async function actionLogout(objPost) {
    try {
      const { token } = objPost;
  
      // Buscar el usuario en la base de datos por el token
      const selectQuery = `SELECT nom AS userName FROM usuarios WHERE token = '${token}'`;
  
      const result = await db.query(selectQuery);
  
      if (result.length === 0) {
        // Si no encuentra al usuario, aún se considera un logout exitoso
        return { result: 'OK' };
      } else {
        // Actualizar el token en la base de datos (puedes establecer el token a NULL o algún valor especial)
        const updateQuery = `UPDATE usuarios SET token = NULL WHERE token = '${token}'`;
        await db.query(updateQuery);
  
        return { result: 'OK' };
      }
    } catch (error) {
      console.error('Error at "actionLogout":', error);
      return { result: 'KO', message: 'Error al realizar el logout' };
    }
  }
  

async function actionLogin(objPost) {
    try {
      const { userName, userPassword } = objPost;
      const hash = crypto.createHash("md5").update(userPassword).digest("hex");
  
      // Buscar el usuario en la base de datos
      const selectQuery = `SELECT nom AS userName, token FROM usuarios WHERE nom = '${userName}' AND pwdHash = '${hash}'`;
  
      const result = await db.query(selectQuery);
  
      if (result.length === 0) {
        return { result: "KO" };
      } else {
        const token = uuidv4();
  
        // Actualizar el token en la base de datos
        const updateQuery = `UPDATE usuarios SET token = '${token}' WHERE nom = '${userName}'`;
        await db.query(updateQuery);
  
        return { result: "OK", userName: result[0].userName, token: token };
      }
    } catch (error) {
      console.error('Error at "actionLogin":', error);
      return { result: "KO", message: "Error al iniciar sesión" };
    }
  }
  

async function actionSignUp(objPost) {
    try {
      let userName = objPost.userName;
      let userPassword = objPost.userPassword;
      let hash = crypto.createHash("md5").update(userPassword).digest("hex");
      let token = uuidv4();
  
      // Insertar el usuario en la base de datos
      const insertQuery = `INSERT INTO usuarios (nom, pwdHash, token) VALUES ('${userName}', '${hash}','${token}')`;
      const insertValues = [userName, hash, token];
  
      await db.query(insertQuery, insertValues);
  
      return { result: "OK", userName: userName, token: token };
    } catch (error) {
      console.error('Error at "actionSignUp":', error);
      return { result: "KO", message: "Error al registrar el usuario" };
    }
  }