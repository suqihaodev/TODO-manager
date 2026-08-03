const express = require('express')
const {pool, initDb} = require('./db')

const app = express()
app.use(express.json()) // middleware para procesar el cuerpo de peticiones entrantes

const port = 3000

/**
 * Ruta GET para obtener el listado completo de tareas.
 * @description Realiza una consulta asíncrona a la base de datos PostgreSQL,
 * recupera todas las tareas ordenadas por su ID de forma ascendente
 * y las retorna en formato JSON.
 *
 * @route GET /view
 * @param {import('express').Request} req - Objeto de petición del cliente.
 * @param {import('express').Response} res - Objeto para construir y enviar la respuesta al cliente.
 * @returns {Promise<void>} Envía una respuesta HTTP con el arreglo de tareas o un error.
 */
app.get('/view', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT * 
            FROM TASK
            ORDER BY ID ASC
        `)

        res.json(result.rows)
    } catch (e) {
        console.error('Error: ', e.message)
        res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * Ruta POST para crear una nueva tarea.
 * @description Recibe los datos de la tarea, genera un ID único basado en el timestamp
 * e inserta el registro de forma segura en la base de datos PostgreSQL.
 *
 * @route POST /add
 * @param {import('express').Request} req - Objeto de petición del cliente.
 * @param {import('express').Response} res - Objeto para construir y enviar la respuesta al cliente.
 * @returns {Promise<void>} Envía un estado 201 con la tarea creada o un estado 500 si falla.
 */

app.post('/add', async (req, res) => {
    try {
        const {name, priority} = req.body
        const id = Date.now()
        const result = await pool.query(`
            INSERT INTO task (id, name, priority, completed)
            VALUES (${id}, '${name}', '${priority}', false)
            RETURNING *
        `)

        res.status(201).json(result.rows[0])
    } catch (e) {
        console.error('Error: ', e.message)
        res.status(500).json({error: 'Internal server error'})
    }
})

/**
 * Ruta DELETE para eliminar una tarea específica por su ID.
 * @description Valida la existencia del ID en la petición, ejecuta el borrado seguro
 * en PostgreSQL y verifica si el registro realmente existía antes de responder.
 *
 * @route DELETE /delete
 * @param {import('express').Request} req - Objeto de petición del cliente.
 * @param {import('express').Response} res - Objeto para construir y enviar la respuesta al cliente.
 * @returns {Promise<void>} Envía la tarea eliminada, o un código de estado de error (400, 404, 500).
 */
app.delete('/delete', async (req, res) => {
    try {
        const {id} = req.body

        if (!id) {
            return res.status(400).json({error: "MISSING ID"})
        }

        const result = await pool.query(`
            DELETE
            FROM TASK
            WHERE ID = ${Number(id)}
            RETURNING *
        `)

        if (result.rows.length === 0) {
            return res.status(404).json({error: "TASK NOT FOUND"})
        }
        res.json(result.rows[0])
    } catch (e) {
        console.error('Error: ', e.message)
        res.status(500).json({error: 'Internal server error'})
    }
})

/**
 * Ruta PUT para actualizar una tarea existente por su ID.
 * @description Modifica de forma segura los campos 'name', 'priority' y 'completed'
 * de una tarea específica y retorna el registro actualizado.
 *
 * @route PUT /edit
 * @param {import('express').Request} req - Objeto de petición del cliente.
 * @param {import('express').Response} res - Objeto para construir y enviar la respuesta al cliente.
 * @returns {Promise<void>} Envía la tarea modificada o un estado de error (400, 404, 500).
 */
app.put('/edit', async (req, res) => {

    try {
        const {id, name, priority, completed} = req.body
        if (!id) {
            return res.status(400).json({error: "MISSING ID"})
        }

        const result = await pool.query(`
            UPDATE TASK
            SET NAME      = '${name}',
                PRIORITY  = '${priority}',
                COMPLETED = ${Boolean(completed)}
                WHERE ID = ${Number(id)} RETURNING *
        `)
        if (result.rows.length === 0) {
            return res.status(404).json({error: "TASK NOT FOUND"})
        }

        res.json(result.rows[0])
    } catch (e) {
        console.error('Error: ', e.message)
        res.status(500).json({error: 'Internal server error'})
    }
})

/**
 * Inicialización y encendido del servidor HTTP.
 * @description Pone a la aplicación de Express a escuchar peticiones en el puerto configurado.
 * Antes de confirmar el arranque, intenta ejecutar la inicialización de las tablas
 * de la base de datos de manera asíncrona.
 */
app.listen(port, async () => {
    try {
        await initDb()
        console.log(`Server started on port ${port}`)
    } catch (e) {
        console.error('Failed to initialize database:', e)
    }
})