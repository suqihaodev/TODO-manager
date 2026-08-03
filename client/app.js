console.log("TODO MANAGER \n")


const readline = require('node:readline/promises')
const { stdin, stdout } = require('node:process')



/**
 * Solicita una entrada de texto al usuario a través de la consola de forma asíncrona.
 * @description Abre una interfaz de lectura en la terminal, muestra un prompt,
 * espera a que el usuario escriba y presione Enter, y cierra la interfaz inmediatamente
 * para liberar los recursos antes de retornar el texto.
 *
 * @async
 * @function ask
 * @returns {Promise<string>} Una promesa que se resuelve con la respuesta escrita por el usuario.
 */
async function ask() {
    const rl = readline.createInterface({ input: stdin, output: stdout })
    const action = await rl.question("> ")
    rl.close()
    return action
}

/**
 * Muestra el menú de opciones en la consola y captura la selección del usuario.
 * @description Imprime en la terminal la lista de acciones disponibles para la
 * gestión del CRUD de tareas y delega la captura de la entrada de texto a la función 'ask'.
 *
 * @async
 * @function menu
 * @returns {Promise<string>} Promesa que se resuelve con la opción seleccionada por el usuario (ej. "1", "2").
 */
async function menu() {

    console.log(`Select action:
    [1] VIEW TASKS
    [2] CREATE TASK
    [3] EDIT TASK
    [4] DELETE TASK
    [5] EXIT\n`)

    return await ask()

}

/**
 * Recupera el listado de tareas desde la API y lo muestra en la consola.
 * @description Realiza una petición HTTP GET a la ruta '/view' del servidor local,
 * procesa la respuesta JSON y recorre el arreglo de tareas para imprimir de forma
 * estructurada y estética las propiedades de cada una (Nombre, ID, Prioridad y Estado).
 *
 * @async
 * @function view_tasks
 * @returns {Promise<void>} No retorna ningún valor, solo imprime los datos en la terminal.
 */
async function view_tasks() {
    const raw_res = await fetch("http://localhost:3000/view")
    const tasks = await raw_res.json()

    console.log("\n -------------- TASKS -------------- \n")
    for(const t of tasks) {
        console.log(`\t- ${t.name}`)
        console.log(`\t  ID: ${t.id}`)
        console.log(`\t  Priority: ${t.priority}`)
        console.log(`\t  Completed: ${t.completed}`)
        console.log()
    }
    console.log("----------------------------------- \n")
}

/**
 * Interactúa con el usuario para recopilar los datos de una nueva tarea y la envía a la API.
 * @description Solicita en la terminal el nombre y la prioridad de la tarea. Convierte la
 * selección numérica de prioridad en texto plano y envía un objeto JSON mediante una petición
 * HTTP POST al endpoint '/add'. Muestra un mensaje de éxito o el error devuelto por el servidor.
 *
 * @async
 * @function add_task
 * @returns {Promise<void>} No retorna ningún valor, maneja la interacción y la red.
 */
async function add_task() {
    console.log("\n --------- CREATE TASK -----------")
    console.log("Task name: ")
    const name = await ask("")

    console.log("Task priority [1: High | 2: Low]: ")
    let priority = await ask("")
    if (priority.trim() === '1') priority = "high"
    else priority = "low"

    const new_task = {
        name: name,
        priority: priority,
        completed: false
    }

    const res = await fetch("http://localhost:3000/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(new_task)
    })

    if (res.ok) {
        console.log("TASK SUCCESFULLY ADDED\n")
    } else {
        const errorData = await res.json()
        console.log(`ERROR: ${errorData.error}`)
    }
}

/**
 * Interfaz de consola para eliminar una tarea mediante su identificador.
 * @description Muestra primero el listado actual de tareas para facilitar la copia del ID,
 * solicita el ID al usuario, valida que sea un número correcto y realiza una petición
 * HTTP DELETE enviando el ID en formato JSON a la API.
 *
 * @async
 * @function delete_task
 * @returns {Promise<void>} No retorna ningún valor, gestiona la impresión y el flujo de red.
 */
async function delete_task() {
    await view_tasks()

    console.log("ID of the task to delete: ")
    let id = await ask()
    id = Number(id.trim())

    if (!id || isNaN(id)) {
        console.log("ERROR: INVALID ID")
        return
    }

    const res = await fetch("http://localhost:3000/delete", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({id})
    })

    if (res.ok) {
        console.log("TASK SUCCESFULLY DELETED\n")
    } else {
        const errorData = await res.json()
        console.log(`ERROR: ${errorData.error}`)
    }

}

/**
 * Interfaz de consola para editar los campos de una tarea existente.
 * @description Muestra el listado de tareas, solicita el ID al usuario, realiza
 * una validación de entrada y recopila de forma opcional los nuevos valores (Nombre,
 * Prioridad y Estado). Construye dinámicamente el cuerpo de la petición omitiendo los
 * campos vacíos y envía una actualización vía HTTP PUT a la API.
 *
 * @async
 * @function edit_task
 * @returns {Promise<void>} No retorna ningún valor; gestiona la terminal y la red de forma asíncrona.
 */
async function edit_task() {
    await view_tasks()
    console.log("ID of the task to edit: ")

    let id = await ask()
    id = Number(id.trim())

    if (!id || isNaN(id)) {
        console.log("ERROR: INVALID ID")
        return
    }

    console.log("--------- PRESS ENTER TO SKIP ---------")
    console.log("New name: ")
    const name = await ask()

    console.log("New priority [1: High | 2: Low]: ")
    const priorityInput = await ask()
    let priority = undefined
    if (priorityInput.trim() === '1') priority = "high"
    if (priorityInput.trim() === '2') priority = "low"

    console.log("Completed [1: Yes | 2: No]: ")
    const completedInput = await ask()
    let completed = undefined
    if (completedInput.trim() === '1') completed = true
    if (completedInput.trim() === '2') completed = false

    const bodyData = { id }

    if (name.trim() !== "") bodyData.name = name.trim()
    if (priority !== undefined) bodyData.priority = priority
    if (completed !== undefined) bodyData.completed = completed

    const res = await fetch("http://localhost:3000/edit", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(bodyData)
    })

    if (res.ok) {
        console.log("TASK SUCCESFULLY UPDATED\n")
    } else {
        const errorData = await res.json()
        console.log(`ERROR: ${errorData.error}`)
    }
}

/**
 * Punto de entrada principal y bucle de ejecución de la aplicación CLI.
 * @description Mantiene la aplicación activa mediante un ciclo 'while' infinito controlado.
 * Presenta el menú en cada iteración, captura la opción seleccionada y ejecuta de forma
 * asíncrona la acción correspondiente (ver, añadir, editar o eliminar tareas) mediante un 'switch'.
 * El ciclo se rompe limpiamente cuando el usuario elige la opción de salida.
 *
 * @async
 * @function main
 * @returns {Promise<void>} No retorna ningún valor; controla el ciclo de vida de la aplicación en terminal.
 */
async function main() {
    let run = true
    while (run) {

        const action = await menu()

        switch (action.trim()) {
            case '1':
                await view_tasks()
                break
            case '2':
                await add_task()
                break
            case '3':
                await edit_task()
                break
            case '4':
                await delete_task()
                break
            case '5':
                run = false
                break
        }

    }

    console.log("Program finished")
}

main()