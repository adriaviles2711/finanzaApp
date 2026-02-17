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
    // IMPORTACIÓN DE DATOS
    // ===========================================================

    /**
     * Importar datos desde JSON (Copia de seguridad)
     * @param {object} datos - Objeto con transacciones y categorías
     * @returns {Promise<object>} Resumen de la importación
     */
    async importarDatosJson(datos) {
        if (!userId) throw new Error('Usuario no autenticado')

        let resumen = {
            categorias: 0,
            transacciones: 0,
            errores: 0
        }

        // 1. Importar Categorías
        if (datos.categorias && Array.isArray(datos.categorias)) {
            const categoriasExistentes = await localDbService.obtenerCategorias(userId)
            const mapCategorias = new Map()

            // Crear mapa de categorías existentes para evitar duplicados por nombre
            categoriasExistentes.forEach(c => {
                mapCategorias.set(`${c.nombre.toLowerCase()}_${c.tipo}`, c.id)
            })

            for (const cat of datos.categorias) {
                try {
                    // Si viene del mismo usuario original, intentar mantener ID
                    const key = `${(cat.nombre || '').toLowerCase()}_${cat.tipo}`

                    if (!mapCategorias.has(key)) {
                        // Crear nueva categoría si no existe
                        const nuevaCat = {
                            nombre: cat.nombre,
                            tipo: cat.tipo,
                            icono: cat.icono,
                            color: cat.color,
                            user_id: userId
                        }
                        const creada = await this.crearCategoria(nuevaCat)
                        mapCategorias.set(key, creada.id)
                        resumen.categorias++
                    }
                } catch (e) {
                    console.error('Error importando categoría:', e)
                    resumen.errores++
                }
            }
        }

        // 2. Importar Transacciones
        if (datos.transacciones && Array.isArray(datos.transacciones)) {
            // Obtener categorías actualizadas para mapear
            const categoriasActuales = await localDbService.obtenerCategorias(userId)
            const mapCategoriasIds = new Map() // Map ID original -> ID nuevo (por nombre)

            // Reconstruir mapa por nombre para buscar coincidencias
            categoriasActuales.forEach(c => {
                mapCategoriasIds.set(`${c.nombre.toLowerCase()}_${c.tipo}`, c.id)
            })

            // Intentar mapear IDs antiguos si vienen en el JSON
            const mapIdsAntiguos = new Map()
            if (datos.categorias) {
                datos.categorias.forEach(c => {
                    if (c.id && c.nombre && c.tipo) {
                        const nuevoId = mapCategoriasIds.get(`${c.nombre.toLowerCase()}_${c.tipo}`)
                        if (nuevoId) {
                            mapIdsAntiguos.set(c.id, nuevoId)
                        }
                    }
                })
            }

            for (const tx of datos.transacciones) {
                try {
                    // Validar campos mínimos
                    if (!tx.monto || !tx.fecha) continue

                    // Buscar categoría correcta
                    let categoryId = tx.category_id

                    // Si el ID no existe en las categorías actuales, intentar buscar por nombre/tipo mapeado
                    // O usar el mapa de IDs antiguos si está disponible
                    if (mapIdsAntiguos.has(categoryId)) {
                        categoryId = mapIdsAntiguos.get(categoryId)
                    } else if (tx.category) {
                        // Buscar por objeto categoría incrustado
                        const key = `${(tx.category.nombre || '').toLowerCase()}_${tx.category.tipo || tx.tipo}`
                        if (mapCategoriasIds.has(key)) {
                            categoryId = mapCategoriasIds.get(key)
                        }
                    }

                    // Si aún no tenemos categoría, asignar a "Otros" o similar, o crearla?
                    // Por ahora, si no encuentra, se queda sin categoría (null) o el ID original que fallará al mostrar
                    // Mejor intentar buscar una categoría "General" o "Otros" del mismo tipo
                    if (!categoryId && tx.tipo) {
                        // Fallback básico
                        const generalKey = `otros_${tx.tipo}`
                        // Buscar alguna categoría del mismo tipo si no hay "otros" especifica
                        const catDelTipo = categoriasActuales.find(c => c.tipo === tx.tipo)
                        if (catDelTipo) categoryId = catDelTipo.id
                    }

                    const nuevaTx = {
                        monto: tx.monto,
                        fecha: tx.fecha,
                        descripcion: tx.descripcion,
                        tipo: tx.tipo,
                        category_id: categoryId,
                        user_id: userId,
                        archivo_url: tx.archivo_url || null,
                        archivo_nombre: tx.archivo_nombre || null
                    }

                    await this.crearTransaccion(nuevaTx)
                    resumen.transacciones++
                } catch (e) {
                    console.error('Error importando transacción:', e)
                    resumen.errores++
                }
            }
        }

        return resumen
    },

    /**
     * Importar transacciones desde CSV
     * @param {string} csvText - Contenido del CSV
     * @returns {Promise<object>} Resumen de la importación
     */
    async importarTransaccionesCSV(csvText) {
        if (!userId) throw new Error('Usuario no autenticado')

        let resumen = {
            transacciones: 0,
            errores: 0
        }

        const lines = csvText.split('\n')
        if (lines.length < 2) return resumen // Solo cabecera o vacío

        // Obtener categorías para mapear
        const categorias = await localDbService.obtenerCategorias(userId)

        // Headers esperados: Date, Type, Category, Description, Amount
        // Normalizar headers para ser flexibles
        const headers = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/"/g, ''))

        const idxFecha = headers.findIndex(h => h.includes('date') || h.includes('fecha'))
        const idxTipo = headers.findIndex(h => h.includes('type') || h.includes('tipo'))
        const idxCat = headers.findIndex(h => h.includes('category') || h.includes('categoría') || h.includes('categoria'))
        const idxDesc = headers.findIndex(h => h.includes('description') || h.includes('descripción') || h.includes('descripcion'))
        const idxMonto = headers.findIndex(h => h.includes('amount') || h.includes('monto') || h.includes('cantidad'))

        if (idxFecha === -1 || idxMonto === -1) {
            throw new Error('Formato CSV inválido. Se requieren al menos Fecha y Monto.')
        }

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim()
            if (!line) continue

            try {
                // Parsear línea respetando comillas (básico)
                // Nota: Para un parsing robusto se recomienda una librería, pero esto servirá para el formato simple exportado
                const row = []
                let inQuotes = false
                let currentVal = ''
                for (let char of line) {
                    if (char === '"') {
                        inQuotes = !inQuotes
                    } else if (char === ',' && !inQuotes) {
                        row.push(currentVal)
                        currentVal = ''
                    } else {
                        currentVal += char
                    }
                }
                row.push(currentVal) // Último valor

                const fechaStr = row[idxFecha]?.trim()
                const montoStr = row[idxMonto]?.trim()
                const tipoStr = idxTipo !== -1 ? row[idxTipo]?.trim().toLowerCase() : ''
                const catNombre = idxCat !== -1 ? row[idxCat]?.trim() : ''
                const descripcion = idxDesc !== -1 ? row[idxDesc]?.trim().replace(/"/g, '') : 'Importado CSV'

                if (!fechaStr || !montoStr) continue

                // Conversión de datos
                const monto = parseFloat(montoStr)
                if (isNaN(monto)) continue

                // Determinar tipo si no está explícito (basado en signo del monto)
                let tipo = tipoStr
                if (!tipo) {
                    tipo = monto >= 0 ? 'ingreso' : 'gasto'
                }
                // Normalizar tipo
                if (tipo.includes('ingreso') || tipo.includes('income')) tipo = 'ingreso'
                else if (tipo.includes('gasto') || tipo.includes('expense')) tipo = 'gasto'
                else tipo = 'gasto' // Default

                // Buscar categoría
                let categoryId = null
                if (catNombre) {
                    const catObj = categorias.find(c =>
                        c.nombre.toLowerCase() === catNombre.toLowerCase() &&
                        c.tipo === tipo
                    )
                    if (catObj) categoryId = catObj.id
                }

                // Fallback categoría
                if (!categoryId) {
                    const catObj = categorias.find(c => c.tipo === tipo) // Cualquiera del mismo tipo
                    if (catObj) categoryId = catObj.id
                }

                const nuevaTx = {
                    fecha: fechaStr, // Asumimos formato compatible YYYY-MM-DD o ISO
                    monto: Math.abs(monto), // Guardamos absoluto, el tipo define signo
                    tipo: tipo,
                    descripcion: descripcion,
                    category_id: categoryId,
                    user_id: userId
                }

                await this.crearTransaccion(nuevaTx)
                resumen.transacciones++

            } catch (e) {
                console.warn(`Error en línea ${i + 1}:`, e)
                resumen.errores++
            }
        }

        return resumen
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
