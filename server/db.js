require('dotenv').config()
const { Pool } = require('pg')

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false
    }
})

/**
 * Verificación inicial de conectividad con la base de datos.
 * @description Ejecuta una consulta ligera usando un callback.
 * Sirve para validar que las credenciales de conexión (host, usuario, contraseña, puerto)
 * sean válidas al momento de arrancar la aplicación.
 */
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.log('CONEXION ERROR', err.message)
    } else {
        console.log(`Connection established with the database [${res.rows[0].now}]`)
    }
})

/**
 * Inicializa el esquema de la base de datos.
 * @description Ejecuta una consulta DDL para asegurar
 * la existencia de la tabla 'task' con su estructura requerida. Si la tabla ya existe,
 * la instrucción se omite sin alterar los datos actuales.
 *
 * @async
 * @function initDb
 * @returns {Promise<void>} Una promesa que se resuelve cuando la tabla se crea o ya existe.
 */
const initDb = async () => {
    const query = `CREATE TABLE IF NOT EXISTS task (
    id BIGINT PRIMARY KEY,
    name TEXT NOT NULL,
    priority TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE
    );`

    try {
        await pool.query(query)
    } catch (e) {
        console.log("Error: ", e)
    }
}

/**
 * Módulos exportados para ser utilizados en server.js
 * @module Database
 * @property {import('pg').Pool} pool - Instancia del pool de conexiones para realizar consultas SQL desde cualquier parte de la app.
 * @property {Function} initDb - Función asíncrona para asegurar la creación del esquema y las tablas de datos.
 */
module.exports = {
    pool,
    initDb
}