/**
 * =====================================================
 * FINANZAPRO - Base de Datos Local (Dexie.js)
 * =====================================================
 * Implementación de IndexedDB para almacenamiento offline
 * usando Dexie.js como wrapper elegante.
 * 
 * Arquitectura Offline-First:
 * 1. Los datos se guardan PRIMERO localmente (instantáneo)
 * 2. La UI se actualiza inmediatamente
 * 3. La sincronización con Supabase ocurre en segundo plano
 */

import Dexie from 'dexie'

/**
 * Definición de la base de datos local
 * Estructura similar a la de Supabase para facilitar sincronización
 */
class FinanzaProDB extends Dexie {
    constructor() {
        super('FinanzaProDB')

        // Definir esquema de la base de datos
        // El primer campo de cada tabla es la clave primaria
        // Los campos con & son únicos, los campos con * son multi-valor
        this.version(1).stores({
            // Perfil del usuario (clave: id de Supabase)
            profiles: 'id, email, updated_at',

            // Categorías (clave: id, índices: user_id, tipo)
            categories: 'id, user_id, tipo, nombre, updated_at, sync_status',

            // Transacciones (clave: id, índices: user_id, fecha, tipo, category_id)
            transactions: 'id, user_id, category_id, tipo, fecha, updated_at, sync_status',

            // Presupuestos (clave: id, índices: user_id, category_id, mes, anio)
            budgets: 'id, user_id, category_id, mes, anio, updated_at, sync_status',

            // Cola de sincronización pendiente
            syncQueue: '++id, tabla, operacion, registro_id, timestamp'
        })

        // Version 2: Add goals table
        this.version(2).stores({
            profiles: 'id, email, updated_at',
            categories: 'id, user_id, tipo, nombre, updated_at, sync_status',
            transactions: 'id, user_id, category_id, tipo, fecha, updated_at, sync_status',
            budgets: 'id, user_id, category_id, mes, anio, updated_at, sync_status',
            syncQueue: '++id, tabla, operacion, registro_id, timestamp',
            // Metas financieras
            goals: 'id, user_id, nombre, fecha_limite, updated_at, sync_status'
        })

        // Referencias a las tablas (para autocompletado)
        this.profiles = this.table('profiles')
        this.categories = this.table('categories')
        this.transactions = this.table('transactions')
        this.budgets = this.table('budgets')
        this.syncQueue = this.table('syncQueue')
        this.goals = this.table('goals')
    }
}

// Instancia única de la base de datos
export const db = new FinanzaProDB()

/**
 * Servicio de Base de Datos Local
 * Funciones para operaciones CRUD locales
 */
export const localDbService = {

    // ----- TRANSACCIONES -----

    /**
     * Obtener todas las transacciones locales del usuario
     * @param {string} userId - ID del usuario
     * @param {object} filtros - Filtros opcionales
     * @returns {Promise<Array>}
     */
    async obtenerTransacciones(userId, filtros = {}) {
        let query = db.transactions.where('user_id').equals(userId)

        let resultados = await query.toArray()

        // Aplicar filtros en memoria (IndexedDB no soporta todos los filtros)
        if (filtros.tipo) {
            resultados = resultados.filter(t => t.tipo === filtros.tipo)
        }
        if (filtros.fechaInicio) {
            resultados = resultados.filter(t => t.fecha >= filtros.fechaInicio)
        }
        if (filtros.fechaFin) {
            resultados = resultados.filter(t => t.fecha <= filtros.fechaFin)
        }
        if (filtros.categoriaId) {
            resultados = resultados.filter(t => t.category_id === filtros.categoriaId)
        }

        // Ordenar por fecha descendente
        resultados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

        // Aplicar límite
        if (filtros.limite) {
            resultados = resultados.slice(0, filtros.limite)
        }

        // Adjuntar información de categoría
        const categorias = await db.categories.where('user_id').equals(userId).toArray()
        const categoriasMap = new Map(categorias.map(c => [c.id, c]))

        resultados = resultados.map(t => ({
            ...t,
            category: categoriasMap.get(t.category_id) || null
        }))

        return resultados
    },

    /**
     * Crear una transacción local
     * @param {object} transaccion - Datos de la transacción
     * @returns {Promise<object>}
     */
    async crearTransaccion(transaccion) {
        // Generar ID único si no existe
        const nuevaTransaccion = {
            ...transaccion,
            id: transaccion.id || crypto.randomUUID(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            sync_status: 'pending' // Marcar como pendiente de sincronizar
        }

        await db.transactions.add(nuevaTransaccion)

        // Añadir a la cola de sincronización
        await this.agregarACola('transactions', 'INSERT', nuevaTransaccion.id)

        return nuevaTransaccion
    },

    /**
     * Actualizar una transacción local
     * @param {string} id - ID de la transacción
     * @param {object} cambios - Campos a actualizar
     * @returns {Promise<object>}
     */
    async actualizarTransaccion(id, cambios) {
        const updates = {
            ...cambios,
            updated_at: new Date().toISOString(),
            sync_status: 'pending'
        }

        await db.transactions.update(id, updates)

        // Añadir a la cola de sincronización
        await this.agregarACola('transactions', 'UPDATE', id)

        return await db.transactions.get(id)
    },

    /**
     * Eliminar una transacción local
     * @param {string} id - ID de la transacción
     * @returns {Promise<void>}
     */
    async eliminarTransaccion(id) {
        // Obtener transacción antes de eliminar (para cola de sync)
        const transaccion = await db.transactions.get(id)

        await db.transactions.delete(id)

        // Añadir a la cola de sincronización
        if (transaccion) {
            await this.agregarACola('transactions', 'DELETE', id, transaccion)
        }
    },

    // ----- CATEGORÍAS -----

    /**
     * Obtener todas las categorías locales
     * @param {string} userId - ID del usuario
     * @param {string} tipo - Filtrar por tipo (opcional)
     * @returns {Promise<Array>}
     */
    async obtenerCategorias(userId, tipo = null) {
        let resultados = await db.categories
            .where('user_id')
            .equals(userId)
            .toArray()

        if (tipo) {
            // Use case-insensitive comparison for tipo
            const tipoLower = tipo.toLowerCase()
            resultados = resultados.filter(c => c.tipo?.toLowerCase() === tipoLower)
        }

        return resultados.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''))
    },

    /**
     * Crear una categoría local
     * @param {object} categoria - Datos de la categoría
     * @returns {Promise<object>}
     */
    async crearCategoria(categoria) {
        const nuevaCategoria = {
            ...categoria,
            id: categoria.id || crypto.randomUUID(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            sync_status: 'pending'
        }

        await db.categories.add(nuevaCategoria)
        await this.agregarACola('categories', 'INSERT', nuevaCategoria.id)

        return nuevaCategoria
    },

    /**
     * Actualizar una categoría local
     * @param {string} id - ID de la categoría
     * @param {object} cambios - Campos a actualizar
     * @returns {Promise<object>}
     */
    async actualizarCategoria(id, cambios) {
        const updates = {
            ...cambios,
            updated_at: new Date().toISOString(),
            sync_status: 'pending'
        }

        await db.categories.update(id, updates)
        await this.agregarACola('categories', 'UPDATE', id)

        return await db.categories.get(id)
    },

    /**
     * Eliminar una categoría local
     * @param {string} id - ID de la categoría
     * @returns {Promise<void>}
     */
    async eliminarCategoria(id) {
        const categoria = await db.categories.get(id)
        await db.categories.delete(id)

        if (categoria) {
            await this.agregarACola('categories', 'DELETE', id, categoria)
        }
    },

    // ----- PRESUPUESTOS -----

    /**
     * Obtener presupuestos locales
     * @param {string} userId - ID del usuario
     * @param {number} mes - Mes (opcional)
     * @param {number} anio - Año (opcional)
     * @returns {Promise<Array>}
     */
    async obtenerPresupuestos(userId, mes = null, anio = null) {
        let resultados = await db.budgets
            .where('user_id')
            .equals(userId)
            .toArray()

        if (mes) resultados = resultados.filter(p => p.mes === mes)
        if (anio) resultados = resultados.filter(p => p.anio === anio)

        // Adjuntar información de categoría
        const categorias = await db.categories.where('user_id').equals(userId).toArray()
        const categoriasMap = new Map(categorias.map(c => [c.id, c]))

        resultados = resultados.map(p => ({
            ...p,
            category: categoriasMap.get(p.category_id) || null
        }))

        return resultados
    },

    /**
     * Guardar un presupuesto local
     * @param {object} presupuesto - Datos del presupuesto
     * @returns {Promise<object>}
     */
    async guardarPresupuesto(presupuesto) {
        const nuevoPresupuesto = {
            ...presupuesto,
            id: presupuesto.id || crypto.randomUUID(),
            updated_at: new Date().toISOString(),
            sync_status: 'pending'
        }

        await db.budgets.put(nuevoPresupuesto)
        await this.agregarACola('budgets', 'UPSERT', nuevoPresupuesto.id)

        return nuevoPresupuesto
    },

    // ----- PERFIL -----

    /**
     * Obtener perfil local
     * @param {string} userId - ID del usuario
     * @returns {Promise<object|null>}
     */
    async obtenerPerfil(userId) {
        return await db.profiles.get(userId)
    },

    /**
     * Guardar perfil local
     * @param {object} perfil - Datos del perfil
     * @returns {Promise<object>}
     */
    async guardarPerfil(perfil) {
        await db.profiles.put(perfil)
        return perfil
    },

    // ----- ESTADÍSTICAS -----

    /**
     * Obtener resumen financiero del mes
     * @param {string} userId - ID del usuario
     * @param {number} mes - Mes (1-12)
     * @param {number} anio - Año
     * @returns {Promise<object>}
     */
    async obtenerResumenMes(userId, mes = null, anio = null) {
        const ahora = new Date()
        const mesActual = mes || ahora.getMonth() + 1
        const anioActual = anio || ahora.getFullYear()

        // Calcular rango de fechas
        const primerDia = `${anioActual}-${String(mesActual).padStart(2, '0')}-01`
        const ultimoDia = new Date(anioActual, mesActual, 0).getDate()
        const fechaFin = `${anioActual}-${String(mesActual).padStart(2, '0')}-${ultimoDia}`

        const transacciones = await db.transactions
            .where('user_id')
            .equals(userId)
            .and(t => t.fecha >= primerDia && t.fecha <= fechaFin)
            .toArray()

        const resumen = {
            ingresos: 0,
            gastos: 0,
            balance: 0,
            totalTransacciones: transacciones.length
        }

        transacciones.forEach(t => {
            if (t.tipo === 'ingreso') {
                resumen.ingresos += parseFloat(t.monto)
            } else {
                resumen.gastos += parseFloat(t.monto)
            }
        })

        resumen.balance = resumen.ingresos - resumen.gastos

        return resumen
    },

    // ----- COLA DE SINCRONIZACIÓN -----

    /**
     * Añadir operación a la cola de sincronización
     * @param {string} tabla - Nombre de la tabla
     * @param {string} operacion - Tipo de operación (INSERT, UPDATE, DELETE)
     * @param {string} registroId - ID del registro afectado
     * @param {object} datosExtra - Datos adicionales (para DELETE)
     */
    async agregarACola(tabla, operacion, registroId, datosExtra = null) {
        await db.syncQueue.add({
            tabla,
            operacion,
            registro_id: registroId,
            datos_extra: datosExtra,
            timestamp: Date.now()
        })
    },

    /**
     * Obtener operaciones pendientes de sincronización
     * @returns {Promise<Array>}
     */
    async obtenerPendientes() {
        return await db.syncQueue.orderBy('timestamp').toArray()
    },

    /**
     * Eliminar operación de la cola (después de sincronizar)
     * @param {number} id - ID de la operación en la cola
     */
    async eliminarDeCola(id) {
        await db.syncQueue.delete(id)
    },

    /**
     * Limpiar cola de sincronización
     */
    async limpiarCola() {
        await db.syncQueue.clear()
    },

    // ----- SINCRONIZACIÓN MASIVA -----

    /**
     * Guardar múltiples transacciones (desde Supabase)
     * @param {Array} transacciones - Array de transacciones
     */
    async guardarTransaccionesMasivo(transacciones) {
        await db.transactions.bulkPut(transacciones.map(t => ({
            ...t,
            sync_status: 'synced'
        })))
    },

    /**
     * Guardar múltiples categorías (desde Supabase)
     * @param {Array} categorias - Array de categorías
     */
    async guardarCategoriasMasivo(categorias) {
        // Map Supabase English column names to Spanish field names used in app
        await db.categories.bulkPut(categorias.map(c => ({
            id: c.id,
            user_id: c.user_id,
            nombre: c.name || c.nombre,
            tipo: c.type || c.tipo,
            icono: c.icon || c.icono,
            color: c.color,
            created_at: c.created_at,
            updated_at: c.updated_at,
            sync_status: 'synced'
        })))
    },

    /**
     * Guardar múltiples presupuestos (desde Supabase)
     * @param {Array} presupuestos - Array de presupuestos
     */
    async guardarPresupuestosMasivo(presupuestos) {
        await db.budgets.bulkPut(presupuestos.map(p => ({
            ...p,
            sync_status: 'synced'
        })))
    },

    // ----- METAS FINANCIERAS -----

    /**
     * Obtener metas del usuario
     * @param {string} userId
     * @returns {Promise<Array>}
     */
    async obtenerMetas(userId) {
        return await db.goals.where('user_id').equals(userId).toArray()
    },

    /**
     * Crear una meta
     * @param {object} meta
     * @returns {Promise<object>}
     */
    async crearMeta(meta) {
        const id = meta.id || crypto.randomUUID()
        const nuevaMeta = {
            ...meta,
            id,
            monto_actual: meta.monto_actual || 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            sync_status: 'pending'
        }
        await db.goals.put(nuevaMeta)
        return nuevaMeta
    },

    /**
     * Actualizar una meta
     * @param {string} id
     * @param {object} cambios
     * @returns {Promise<object>}
     */
    async actualizarMeta(id, cambios) {
        await db.goals.update(id, {
            ...cambios,
            updated_at: new Date().toISOString(),
            sync_status: 'pending'
        })
        return await db.goals.get(id)
    },

    /**
     * Eliminar una meta
     * @param {string} id
     */
    async eliminarMeta(id) {
        await db.goals.delete(id)
    },

    /**
     * Limpiar datos de un usuario (logout)
     * @param {string} userId - ID del usuario
     */
    async limpiarDatosUsuario(userId) {
        await db.transaction('rw',
            [db.transactions, db.categories, db.budgets, db.profiles, db.goals, db.syncQueue],
            async () => {
                await db.transactions.where('user_id').equals(userId).delete()
                await db.categories.where('user_id').equals(userId).delete()
                await db.budgets.where('user_id').equals(userId).delete()
                await db.goals.where('user_id').equals(userId).delete()
                await db.profiles.delete(userId)
                await db.syncQueue.clear()
            }
        )
    }
}

// Exportar base de datos por defecto
export default db
