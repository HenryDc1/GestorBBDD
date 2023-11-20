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
    const requ = {
        deleteid:deleteid
    }
    // Realizar la solicitud AJAX para borrar datos
    try {
        load('usuarios');
        let result = await fetch('/deleteData', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requ)
        });


        if (result.ok) {
            // La solicitud fue exitosa
            console.log('Datos borrados con éxito');
            document.getElementById('feedbackMessageDeleteData').textContent = 'Dato borrado con éxito';
            // Puedes realizar acciones adicionales aquí si es necesario
            // Por ejemplo, recargar la tabla de datos
        } else {
            // La solicitud falló
            console.error('Error al borrar datos:', result.status, result.statusText);
            document.getElementById('feedbackMessageDeleteData').textContent = 'Error al borrar datos';
            // Puedes mostrar un mensaje de error al usuario o realizar acciones adicionales
        }
    } catch (error) {
        console.error('Error al procesar la solicitud:', error);
        // Puedes mostrar un mensaje de error al usuario o realizar acciones adicionales
    }
}
function crearCamposDeColumnas() {
    var numColumnas = document.getElementById('numeroColumnas').value;
    var columnInputsContainer = document.getElementById('columnInputs');
    columnInputsContainer.innerHTML = ''; // Limpiar contenido existente


    for (var i = 1; i <= numColumnas; i++) {
        var label = document.createElement('label');
        label.textContent = 'Columna' + i + ':';


        var input = document.createElement('input');
        input.type = 'text';
        input.id = 'createColumn' + i;
        input.name = 'column' + i;
        input.required = true;


        // Agregar elementos al contenedor
        columnInputsContainer.appendChild(label);
        columnInputsContainer.appendChild(input);


        // Agregar elemento select (drop-down) para el tipo de columna
        var typeLabel = document.createElement('label');
        typeLabel.textContent = 'Tipo' + i + ':';


        var select = document.createElement('select');
        select.id = 'columnType' + i;
        select.name = 'columnType' + i;
        select.required = true;


        // Opciones para el drop-down (puedes agregar más según tus necesidades)
        var optionInt = document.createElement('option');
        optionInt.value = 'INT';
        optionInt.textContent = 'INT';


        var optionVarchar = document.createElement('option');
        optionVarchar.value = 'VARCHAR(255)';
        optionVarchar.textContent = 'VARCHAR(255)';


        var optionText = document.createElement('option');
        optionText.value = 'TEXT';
        optionText.textContent = 'TEXT';


        // Agregar opciones al select
        select.appendChild(optionInt);
        select.appendChild(optionVarchar);
        select.appendChild(optionText);


        // Agregar elementos de tipo al contenedor
        columnInputsContainer.appendChild(typeLabel);
        columnInputsContainer.appendChild(select);
    }
}


async function crearTabla() {
    const tableName = document.getElementById('createTableName').value;
    const numColumnas = document.getElementById('numeroColumnas').value;


    // Crear un array para almacenar las columnas
    const columns = [];


    for (let i = 1; i <= numColumnas; i++) {
        const columnName = document.getElementById('createColumn' + i).value;
        const columnType = document.getElementById('columnType' + i).value;
        const column = {
            name: columnName,
            type: columnType
        };
        columns.push(column);
    }


    // Crear el objeto de datos a enviar al servidor
    const requestData = {
        tableName: tableName,
        columns: columns
    };


    try {
        // Realizar una solicitud AJAX para crear la tabla en el servidor
        let result = await fetch('/createTable', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });


        if (result.ok) {
            // La solicitud fue exitosa
            console.log('Tabla creada con éxito');
            document.getElementById('feedbackMessage').textContent = 'Tabla creada con éxito';
            // Puedes realizar acciones adicionales aquí si es necesario
        } else {
            // La solicitud falló
            console.error('Error al crear la tabla:', result.status, result.statusText);
            document.getElementById('feedbackMessage').textContent = 'Error al crear la tabla';
            // Puedes mostrar un mensaje de error al usuario o realizar acciones adicionales
        }
    } catch (error) {
        console.error('Error al procesar la solicitud:', error);
        document.getElementById('feedbackMessage').textContent = 'Error al procesar la solicitud';
        // Puedes mostrar un mensaje de error al usuario o realizar acciones adicionales
    }
}


async function modificarTabla() {
    const tableName = document.getElementById('nameModifyTable').value;
    const columnName = document.getElementById('columnName').value;
    const columnType = document.getElementById('columnType').value;
     // Assuming you have an input field for column type
     const operationSelect = document.getElementById('operation').value;
    console.log("Table name --->" + tableName);
    console.log("Column name --->" + columnName);
    console.log("Column type --->" + columnType);


 
      const request = {
        operationSelect:operationSelect,
        tableName: tableName,
        columnName: columnName,
        columnType: columnType // Include columnType in the request
    };


    try {
        // Realizar una solicitud AJAX para modificar datos en el servidor
        let result = await fetch('/updateTable', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request)
        });


        if (result.ok) {
            // La solicitud fue exitosa
            console.log('Datos modificados con éxito');
            // Puedes realizar acciones adicionales aquí si es necesario // Recargar la tabla después de la modificación
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
function toggleColumnTypeInput() {
    const operationSelect = document.getElementById('operation');
    const columnTypeContainer = document.getElementById('columnTypeContainer');


    if (operationSelect.value === 'add') {
        columnTypeContainer.style.display = 'block';
    } else {
        columnTypeContainer.style.display = 'none';
    }
}
async function eliminarTabla(){
    const tableName=document.getElementById('deleteTablebyName').value;
    console.log("consola --->" + tableName);


    const rq = {
        tableName:tableName
    }
      try {
        // Realizar una solicitud AJAX para modificar datos en el servidor
        let result = await fetch('/deleteTable', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(rq)
        });


        if (result.ok) {
            // La solicitud fue exitosa
            console.log('Datos modificados con éxito');
            document.getElementById('feedbackMessageDeleteTable').textContent = 'Tabla borrada con éxito';
            // Puedes realizar acciones adicionales aquí si es necesario // Recargar la tabla después de la modificación
        } else {
            // La solicitud falló
            console.error('Error al modificar datos:', result.status, result.statusText);
            document.getElementById('feedbackMessageDeleteTable').textContent = 'Error al crear la tabla';
            // Puedes mostrar un mensaje de error al usuario o realizar acciones adicionales
        }
    } catch (error) {
        console.error('Error al procesar la solicitud:', error);
        // Puedes mostrar un mensaje de error al usuario o realizar acciones adicionales
    }




}
