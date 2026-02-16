/**
 * =====================================================
 * FINANZAPRO - Data Manager (Gestor de Datos Híbrido)
 * =====================================================
 * Capa de abstracción que maneja la lógica Offline-First:
 * - Lee primero de la base de datos local (instantáneo)
 * - Sincroniza con Supabase en segundo plano
 * - Detecta conflictos y los resuelve
 */

import { authService, dbService, storageService } from './supabase.js'
import { db, localDbService } from './dexie.js'

/**
 * Estado de la conexión
 */
let isOnline = navigator.onLine
let syncInProgress = false
let userId = null

// Escuchar cambios en la conectividad
window.addEventListener('online', () => {
    isOnline = true
    console.log('🌐 Conexión restaurada. Iniciando sincronización...')
    dataManager.sincronizar()
})

window.addEventListener('offline', () => {
    isOnline = false
    console.log('📴 Sin conexión. Trabajando en modo offline.')
})

/**
 * Data Manager - Gestor de Datos Principal
 * Implementa el patrón Offline-First
 */
export const dataManager = {

    /**
     * Inicializar el Data Manager con el usuario actual
     * @param {string} userIdParam - ID del usuario
     */
    async inicializar(userIdParam) {
        userId = userIdParam

        // First, ensure local data is clean
        await this.deduplicarCategorias()

        // Ensure default categories exist locally
        await this.asegurarCategoriasDefecto()

        if (isOnline) {
            // Descargar datos desde Supabase y guardar localmente
            await this.descargarDatosIniciales()
        }

        console.log('✅ Data Manager inicializado para usuario:', userId)
    },

    /**
     * Descargar todos los datos del usuario desde Supabase
     * y guardarlos en la base de datos local
     */
    async descargarDatosIniciales() {
        try {
            console.log('📥 Descargando datos iniciales...')

            // Descargar categorías
            const { data: categorias, error: errorCat } = await dbService.obtenerCategorias()
            if (!errorCat && categorias) {
                await localDbService.guardarCategoriasMasivo(categorias)
                console.log(`  ✓ ${categorias.length} categorías sincronizadas`)
                // Do NOT create defaults here — already handled in inicializar()
            }

            // Descargar transacciones
            const { data: transacciones, error: errorTrans } = await dbService.obtenerTransacciones()
            if (!errorTrans && transacciones) {
                await localDbService.guardarTransaccionesMasivo(transacciones)
                console.log(`  ✓ ${transacciones.length} transacciones sincronizadas`)
            }

            // Descargar presupuestos
            const { data: presupuestos, error: errorPres } = await dbService.obtenerPresupuestos()
            if (!errorPres && presupuestos) {
                await localDbService.guardarPresupuestosMasivo(presupuestos)
                console.log(`  ✓ ${presupuestos.length} presupuestos sincronizados`)
            }

            // Descargar perfil
            const { data: perfil, error: errorPerfil } = await dbService.obtenerPerfil()
            if (!errorPerfil && perfil) {
                await localDbService.guardarPerfil(perfil)
                console.log('  ✓ Perfil sincronizado')
            }

            console.log('📥 Descarga inicial completada')
        } catch (error) {
            console.error('❌ Error en descarga inicial:', error)
        }
    },

    /**
     * Crear categorías por defecto SOLO si no existen aún en local
     */
    async asegurarCategoriasDefecto() {
        const existentes = await localDbService.obtenerCategorias(userId)
        if (existentes && existentes.length > 0) {
            console.log(`  ✓ Ya existen ${existentes.length} categorías locales, no se crean por defecto`)
            return
        }

        console.log('  📂 Creando categorías por defecto...')
        await this.crearCategoriasDefecto()
    },

    /**
     * Crear categorías por defecto para nuevos usuarios
     */
    async crearCategoriasDefecto() {
        const categoriasDefecto = [
            // Gastos (6)
            { nombre: 'Alimentación', tipo: 'gasto', icono: '🛒', color: '#ef4444' },
            { nombre: 'Vivienda', tipo: 'gasto', icono: '🏠', color: '#f97316' },
            { nombre: 'Transporte', tipo: 'gasto', icono: '🚗', color: '#eab308' },
            { nombre: 'Servicios', tipo: 'gasto', icono: '💡', color: '#84cc16' },
            { nombre: 'Entretenimiento', tipo: 'gasto', icono: '🎬', color: '#22c55e' },
            { nombre: 'Salud', tipo: 'gasto', icono: '🩺', color: '#14b8a6' },
            // Ingresos (6)
            { nombre: 'Salario', tipo: 'ingreso', icono: '💰', color: '#06b6d4' },
            { nombre: 'Freelance', tipo: 'ingreso', icono: '💼', color: '#3b82f6' },
            { nombre: 'Inversiones', tipo: 'ingreso', icono: '📈', color: '#6366f1' },
            { nombre: 'Regalos', tipo: 'ingreso', icono: '🎁', color: '#8b5cf6' },
            { nombre: 'Reembolsos', tipo: 'ingreso', icono: '💸', color: '#a855f7' },
            { nombre: 'Otros Ingresos', tipo: 'ingreso', icono: '📦', color: '#ec4899' }
        ]

        for (const cat of categoriasDefecto) {
            try {
                await this.crearCategoria(cat)
            } catch (error) {
                console.error(`Error creando categoría ${cat.nombre}:`, error)
            }
        }
        console.log('  ✓ 12 categorías por defecto creadas')
    },

    /**
     * Deduplicar categorías: elimina duplicados por nombre+tipo, conservando la primera
     */
    async deduplicarCategorias() {
        try {
            const todas = await localDbService.obtenerCategorias(userId)
            if (!todas || todas.length <= 12) return // No dedup needed

            const seen = new Map()
            const duplicateIds = []

            for (const cat of todas) {
                const key = `${cat.nombre}_${cat.tipo}`
                if (seen.has(key)) {
                    duplicateIds.push(cat.id)
                } else {
                    seen.set(key, cat.id)
                }
            }

            if (duplicateIds.length > 0) {
                console.log(`🧹 Eliminando ${duplicateIds.length} categorías duplicadas...`)
                await db.categories.bulkDelete(duplicateIds)
                console.log('  ✓ Categorías deduplicadas')
            }
        } catch (error) {
            console.error('Error deduplicando categorías:', error)
        }
    },

    // ===========================================================
    // TRANSACCIONES
    // ===========================================================

    /**
     * Obtener transacciones (primero local, luego sincroniza)
     * @param {object} filtros - Filtros opcionales
     * @returns {Promise<Array>}
     */
    async obtenerTransacciones(filtros = {}) {
        // Siempre leer primero de local (instantáneo)
        const transaccionesLocales = await localDbService.obtenerTransacciones(userId, filtros)

        // Si hay conexión, sincronizar en segundo plano
        if (isOnline) {
            this.sincronizarEnSegundoPlano()
        }

        return transaccionesLocales
    },

    /**
     * Crear una nueva transacción
     * @param {object} datos - Datos de la transacción
     * @param {File} archivo - Archivo adjunto (opcional)
     * @returns {Promise<object>}
     */
    async crearTransaccion(datos, archivo = null) {
        // Preparar datos
        const transaccion = {
            ...datos,
            user_id: userId
        }

        // Si hay archivo, subirlo primero (requiere conexión)
        if (archivo && isOnline) {
            const { url, path, error } = await storageService.subirArchivo(archivo, userId)
            if (!error) {
                transaccion.archivo_url = url
                transaccion.archivo_nombre = archivo.name
            } else {
                console.warn('⚠️ Error subiendo archivo:', error)
            }
        }

        // Guardar localmente (instantáneo)
        const nuevaTransaccion = await localDbService.crearTransaccion(transaccion)

        // Sincronizar en segundo plano si hay conexión
        if (isOnline) {
            this.sincronizarEnSegundoPlano()
        }

        return nuevaTransaccion
    },

    /**
     * Actualizar una transacción
     * @param {string} id - ID de la transacción
     * @param {object} cambios - Campos a actualizar
     * @returns {Promise<object>}
     */
    async actualizarTransaccion(id, cambios) {
        // Actualizar localmente
        const transaccionActualizada = await localDbService.actualizarTransaccion(id, cambios)

        // Sincronizar en segundo plano
        if (isOnline) {
            this.sincronizarEnSegundoPlano()
        }

        return transaccionActualizada
    },

    /**
     * Eliminar una transacción
     * @param {string} id - ID de la transacción
     */
    async eliminarTransaccion(id) {
        // Obtener transacción para eliminar archivo si existe
        const transacciones = await db.transactions.where('id').equals(id).toArray()
        const transaccion = transacciones[0]

        // Eliminar localmente
        await localDbService.eliminarTransaccion(id)

        // Si tiene archivo y hay conexión, eliminarlo
        if (transaccion?.archivo_url && isOnline) {
            // Extraer path del URL (simplificado)
            try {
                await storageService.eliminarArchivo(`${userId}/${transaccion.archivo_nombre}`)
            } catch (e) {
                console.warn('⚠️ No se pudo eliminar el archivo:', e)
            }
        }

        // Sincronizar en segundo plano
        if (isOnline) {
            this.sincronizarEnSegundoPlano()
        }
    },

    // ===========================================================
    // CATEGORÍAS
    // ===========================================================

    /**
     * Obtener categorías
     * @param {string} tipo - Filtrar por tipo (opcional)
     * @returns {Promise<Array>}
     */
    async obtenerCategorias(tipo = null) {
        const categoriasLocales = await localDbService.obtenerCategorias(userId, tipo)

        if (isOnline) {
            this.sincronizarEnSegundoPlano()
        }

        return categoriasLocales
    },

    /**
     * Crear una categoría
     * @param {object} datos - Datos de la categoría
     * @returns {Promise<object>}
     */
    async crearCategoria(datos) {
        const categoria = {
            ...datos,
            user_id: userId
        }

        const nuevaCategoria = await localDbService.crearCategoria(categoria)

        if (isOnline) {
            this.sincronizarEnSegundoPlano()
        }

        return nuevaCategoria
    },

    /**
     * Actualizar una categoría
     * @param {string} id - ID de la categoría
     * @param {object} cambios - Campos a actualizar
     * @returns {Promise<object>}
     */
    async actualizarCategoria(id, cambios) {
        const categoriaActualizada = await localDbService.actualizarCategoria(id, cambios)

        if (isOnline) {
            this.sincronizarEnSegundoPlano()
        }

        return categoriaActualizada
    },

    /**
     * Eliminar una categoría
     * @param {string} id - ID de la categoría
     */
    async eliminarCategoria(id) {
        await localDbService.eliminarCategoria(id)

        if (isOnline) {
            this.sincronizarEnSegundoPlano()
        }
    },

    // ===========================================================
    // PRESUPUESTOS
    // ===========================================================

    /**
     * Obtener presupuestos
     * @param {number} mes - Mes (opcional)
     * @param {number} anio - Año (opcional)
     * @returns {Promise<Array>}
     */
    async obtenerPresupuestos(mes = null, anio = null) {
        const presupuestosLocales = await localDbService.obtenerPresupuestos(userId, mes, anio)

        if (isOnline) {
            this.sincronizarEnSegundoPlano()
        }

        return presupuestosLocales
    },

    /**
     * Guardar un presupuesto
     * @param {object} datos - Datos del presupuesto
     * @returns {Promise<object>}
     */
    async guardarPresupuesto(datos) {
        const presupuesto = {
            ...datos,
            user_id: userId
        }

        const nuevoPresupuesto = await localDbService.guardarPresupuesto(presupuesto)

        if (isOnline) {
            this.sincronizarEnSegundoPlano()
        }

        return nuevoPresupuesto
    },

    // ===========================================================
    // ESTADÍSTICAS
    // ===========================================================

    /**
     * Obtener resumen financiero del mes
     * @param {number} mes - Mes (1-12)
     * @param {number} anio - Año
     * @returns {Promise<object>}
     */
    async obtenerResumenMes(mes = null, anio = null) {
        return await localDbService.obtenerResumenMes(userId, mes, anio)
    },

    /**
     * Obtener datos para gráficos
     * @param {number} meses - Número de meses a incluir
     * @returns {Promise<object>}
     */
    async obtenerDatosGraficos(meses = 6) {
        const ahora = new Date()
        const datos = {
            etiquetas: [],
            ingresos: [],
            gastos: []
        }

        for (let i = meses - 1; i >= 0; i--) {
            const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1)
            const mes = fecha.getMonth() + 1
            const anio = fecha.getFullYear()

            const resumen = await localDbService.obtenerResumenMes(userId, mes, anio)

            datos.etiquetas.push(fecha.toLocaleDateString('es-ES', { month: 'short' }))
            datos.ingresos.push(resumen.ingresos)
            datos.gastos.push(resumen.gastos)
        }

        return datos
    },

    /**
     * Obtener gastos por categoría
     * @param {number} mes - Mes
     * @param {number} anio - Año
     * @returns {Promise<Array>}
     */
    async obtenerGastosPorCategoria(mes = null, anio = null) {
        const ahora = new Date()
        const mesActual = mes || ahora.getMonth() + 1
        const anioActual = anio || ahora.getFullYear()

        const primerDia = `${anioActual}-${String(mesActual).padStart(2, '0')}-01`
        const ultimoDia = new Date(anioActual, mesActual, 0).getDate()
        const fechaFin = `${anioActual}-${String(mesActual).padStart(2, '0')}-${ultimoDia}`

        // Obtener transacciones de gastos del mes
        const transacciones = await localDbService.obtenerTransacciones(userId, {
            tipo: 'gasto',
            fechaInicio: primerDia,
            fechaFin: fechaFin
        })

        // Agrupar por categoría
        const porCategoria = {}
        transacciones.forEach(t => {
            const catId = t.category_id || 'sin-categoria'
            const catNombre = t.category?.nombre || 'Sin categoría'
            const catColor = t.category?.color || '#6b7280'
            const catIcono = t.category?.icono || '📦'

            if (!porCategoria[catId]) {
                porCategoria[catId] = {
                    id: catId,
                    nombre: catNombre,
                    color: catColor,
                    icono: catIcono,
                    total: 0,
                    cantidad: 0
                }
            }

            porCategoria[catId].total += parseFloat(t.monto)
            porCategoria[catId].cantidad++
        })

        // Convertir a array y ordenar por total
        return Object.values(porCategoria).sort((a, b) => b.total - a.total)
    },

    // ===========================================================
    // SINCRONIZACIÓN
    // ===========================================================

    /**
     * Sincronizar en segundo plano (debounced)
     */
    sincronizarEnSegundoPlano() {
        // Debounce para evitar múltiples llamadas
        if (this._syncTimeout) {
            clearTimeout(this._syncTimeout)
        }

        this._syncTimeout = setTimeout(() => {
            this.sincronizar()
        }, 1000) // Esperar 1 segundo antes de sincronizar
    },

    /**
     * Sincronizar cambios pendientes con Supabase
     */
    async sincronizar() {
        if (!isOnline || syncInProgress || !userId) {
            return
        }

        syncInProgress = true
        console.log('🔄 Iniciando sincronización...')

        try {
            // Obtener operaciones pendientes
            const pendientes = await localDbService.obtenerPendientes()

            if (pendientes.length === 0) {
                console.log('✓ No hay cambios pendientes')
                syncInProgress = false
                return
            }

            console.log(`  Procesando ${pendientes.length} operaciones pendientes...`)

            for (const op of pendientes) {
                try {
                    await this.procesarOperacion(op)
                    await localDbService.eliminarDeCola(op.id)
                    console.log(`  ✓ ${op.operacion} en ${op.tabla}: ${op.registro_id}`)
                } catch (error) {
                    console.error(`  ✗ Error en ${op.operacion} en ${op.tabla}:`, error)
                    // No eliminar de la cola para reintentar después
                }
            }

            console.log('🔄 Sincronización completada')
        } catch (error) {
            console.error('❌ Error en sincronización:', error)
        } finally {
            syncInProgress = false
        }
    },

    /**
     * Procesar una operación pendiente
     * @param {object} operacion - Operación de la cola
     */
    async procesarOperacion(operacion) {
        const { tabla, operacion: tipo, registro_id, datos_extra } = operacion

        switch (tabla) {
            case 'transactions':
                await this.sincronizarTransaccion(tipo, registro_id, datos_extra)
                break
            case 'categories':
                await this.sincronizarCategoria(tipo, registro_id, datos_extra)
                break
            case 'budgets':
                await this.sincronizarPresupuesto(tipo, registro_id, datos_extra)
                break
        }
    },

    /**
     * Sincronizar una transacción específica
     */
    async sincronizarTransaccion(tipo, id, datosExtra) {
        switch (tipo) {
            case 'INSERT':
            case 'UPDATE':
                const transaccion = await db.transactions.get(id)
                if (transaccion) {
                    const { sync_status, category, ...datos } = transaccion
                    if (tipo === 'INSERT') {
                        await dbService.crearTransaccion(datos)
                    } else {
                        await dbService.actualizarTransaccion(id, datos)
                    }
                    await db.transactions.update(id, { sync_status: 'synced' })
                }
                break
            case 'DELETE':
                await dbService.eliminarTransaccion(id)
                break
        }
    },

    /**
     * Sincronizar una categoría específica
     */
    async sincronizarCategoria(tipo, id, datosExtra) {
        switch (tipo) {
            case 'INSERT':
            case 'UPDATE':
                const categoria = await db.categories.get(id)
                if (categoria) {
                    const { sync_status, ...datos } = categoria
                    if (tipo === 'INSERT') {
                        await dbService.crearCategoria(datos)
                    } else {
                        await dbService.actualizarCategoria(id, datos)
                    }
                    await db.categories.update(id, { sync_status: 'synced' })
                }
                break
            case 'DELETE':
                await dbService.eliminarCategoria(id)
                break
        }
    },

    /**
     * Sincronizar un presupuesto específico
     */
    async sincronizarPresupuesto(tipo, id, datosExtra) {
        if (tipo === 'DELETE') {
            // Los presupuestos normalmente no se eliminan, solo se actualizan
            return
        }

        const presupuesto = await db.budgets.get(id)
        if (presupuesto) {
            const { sync_status, category, ...datos } = presupuesto
            await dbService.guardarPresupuesto(datos)
            await db.budgets.update(id, { sync_status: 'synced' })
        }
    },

    // ===========================================================
    // METAS FINANCIERAS
    // ===========================================================

    /**
     * Obtener metas del usuario
     * @returns {Promise<Array>}
     */
    async obtenerMetas() {
        return await localDbService.obtenerMetas(userId)
    },

    /**
     * Crear una meta
     * @param {object} datos
     * @returns {Promise<object>}
     */
    async crearMeta(datos) {
        const meta = { ...datos, user_id: userId }
        return await localDbService.crearMeta(meta)
    },

    /**
     * Actualizar una meta
     * @param {string} id
     * @param {object} cambios
     * @returns {Promise<object>}
     */
    async actualizarMeta(id, cambios) {
        return await localDbService.actualizarMeta(id, cambios)
    },

    /**
     * Eliminar una meta
     * @param {string} id
     */
    async eliminarMeta(id) {
        await localDbService.eliminarMeta(id)
    },

    /**
     * Limpiar datos al cerrar sesión
     */
    async limpiarDatos() {
        if (userId) {
            await localDbService.limpiarDatosUsuario(userId)
        }
        userId = null
    },

    /**
     * Estado de conexión
     * @returns {boolean}
     */
    estaOnline() {
        return isOnline
    },

    /**
     * Obtener ID del usuario actual
     * @returns {string|null}
     */
    obtenerUserId() {
        return userId
    }
}

// Exportar por defecto
export default dataManager
