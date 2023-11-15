window.addEventListener('load', init)
async function init() {
    await load('usuarios')
}

async function load(tableName) {

    document.getElementById('tablaDatos').innerHTML = '';

    // Preparar l'objecte que s'envia al servidor,
    // amb la petició de dades de la taula
    let requestData = {
        callType: 'tableData',
        table: tableName
    }

    // Fer la petició al servidor
    let resultData = []
    try {
        let result = await fetch('/ajaxCall', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        })
        if (!result.ok) {
            throw new Error(`Error HTTP: ${result.status}`)
        }
        resultData = await result.json()
    } catch (e) {
        console.error('Error at "load":', e)
    }

    let headRow = document.createElement('tr');
    let thead0 = document.createElement('td');
    let thead1 = document.createElement('td');
    let thead2 = document.createElement('td');

    thead0.textContent = "ID";
    thead1.textContent = "nom";
    thead2.textContent = "mail";
    headRow.appendChild(thead0);
    headRow.appendChild(thead1);
    headRow.appendChild(thead2);
    document.getElementById('tablaDatos').appendChild(headRow);

    // Mostrar les dades rebudes
    for (let row in resultData) {
        let rowValue = resultData[row]
        let newRow = document.createElement('tr');
        let cell0 = document.createElement('td');
        let cell1 = document.createElement('td');
        let cell2 = document.createElement('td');

        if (tableName == 'usuarios') {
            cell0.textContent = rowValue.id
            cell1.textContent = rowValue.nom
            cell2.textContent = rowValue.mail
        }
        newRow.appendChild(cell0);
        newRow.appendChild(cell1);
        newRow.appendChild(cell2);
        document.getElementById('tablaDatos').appendChild(newRow);
    }
}

async function loadTables() {
    try {
      let result = await fetch('/getTables');
      if (!result.ok) {
        throw new Error(`Error HTTP: ${result.status}`);
      }
      let tables = await result.json();

      // Muestra la lista de tablas en el elemento con id 'tableList'
      let tableList = document.getElementById('tableList');
      tables.forEach(table => {
        let li = document.createElement('li');
        li.textContent = table;
        tableList.appendChild(li);
      });
    } catch (error) {
      console.error('Error al cargar las tablas:', error);
    }
  }
// script.js

async function agregarDato() {
    const nom = document.getElementById('addnom').value;
    const mail = document.getElementById('addmail').value;
    console.log('Valores:', nom, mail);

    // Crear el objeto de datos a enviar al servidor
    const requestData = {
        nom: nom,
        mail: mail
    };

    try {
        // Realizar una solicitud AJAX para agregar datos en el servidor
        let result = await fetch('/addData', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });

        if (result.ok) {
            // La solicitud fue exitosa
            console.log('Datos agregados con éxito');
            // Puedes realizar acciones adicionales aquí si es necesario
            load('usuarios'); // Recargar la tabla después de la adición
        } else {
            // La solicitud falló
            console.error('Error al agregar datos:', result.status, result.statusText);
            // Puedes mostrar un mensaje de error al usuario o realizar acciones adicionales
        }
    } catch (error) {
        console.error('Error al procesar la solicitud:', error);
        // Puedes mostrar un mensaje de error al usuario o realizar acciones adicionales
    }
}




async function modificarDato() {
    const modifyid = document.getElementById('modifyID').value;
    const nom = document.getElementById('modifynom').value;
    const mail = document.getElementById('modifymail').value;
    console.log(modifyid, nom, mail);

    // Crear el objeto de datos a enviar al servidor
    const requestData = {
        id: modifyid,
        nuevonom: nom,
        nuevamail: mail
    };

    try {
        // Realizar una solicitud AJAX para modificar datos en el servidor
        let result = await fetch('/updateData', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });

        if (result.ok) {
            // La solicitud fue exitosa
            console.log('Datos modificados con éxito');
            // Puedes realizar acciones adicionales aquí si es necesario
            load('usuarios'); // Recargar la tabla después de la modificación
        } else {
            // La solicitud falló
            console.error('Error al modificar datos:', result.status, result.statusText);
            // Puedes mostrar un mensaje de error al usuario o realizar acciones adicionales
        }
    } catch (error) {
        console.error('Error al procesar la solicitud:', error);
        // Puedes mostrar un mensaje de error al usuario o realizar acciones adicionales
    }
}

async function eliminarDato() {
    // Obtener confirmación del usuario
    const deleteid = document.getElementById('deleteID').value;
    const confirmacion = confirm('¿Estás seguro de que deseas borrar este registro?');

    if (!confirmacion) {
        console.log('Borrado cancelado por el usuario');
        return;
    }

    // Realizar la solicitud AJAX para borrar datos
    try {
        load('usuarios');
        let result = await fetch('/deleteData', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: deleteid, confirmation: 'confirmar' })
        });

        if (result.ok) {
            // La solicitud fue exitosa
            console.log('Datos borrados con éxito');
            // Puedes realizar acciones adicionales aquí si es necesario
            // Por ejemplo, recargar la tabla de datos
        } else {
            // La solicitud falló
            console.error('Error al borrar datos:', result.status, result.statusText);
            // Puedes mostrar un mensaje de error al usuario o realizar acciones adicionales
        }
    } catch (error) {
        console.error('Error al procesar la solicitud:', error);
        // Puedes mostrar un mensaje de error al usuario o realizar acciones adicionales
    }
}
