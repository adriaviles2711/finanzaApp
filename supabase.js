/**
 * =====================================================
 * FINANZAPRO - Cliente Supabase
 * =====================================================
 * Configuración y exportación del cliente de Supabase
 * para autenticación, base de datos y almacenamiento.
 */

import { createClient } from '@supabase/supabase-js'

// Obtener variables de entorno de Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validar que las variables de entorno estén configuradas
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('⚠️ Error: Variables de entorno de Supabase no configuradas.')
    console.error('Por favor, crea un archivo .env con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY')
}

/**
 * Cliente de Supabase configurado
 * Incluye opciones para persistencia de sesión y auto-refresco de tokens
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        // Almacenar sesión en localStorage para persistencia
        persistSession: true,
        // Detectar sesión automáticamente al cargar
        detectSessionInUrl: true,
        // Auto-refrescar tokens antes de expirar
        autoRefreshToken: true,
        // Almacenamiento personalizado (por defecto usa localStorage)
        storage: window.localStorage
    }
})

/**
 * Servicio de Autenticación
 * Funciones helper para gestionar la autenticación de usuarios
 */
export const authService = {

    /**
     * Registrar un nuevo usuario con email y contraseña
     * @param {string} email - Email del usuario
     * @param {string} password - Contraseña
     * @param {object} metadata - Datos adicionales (nombre, etc.)
     * @returns {Promise<{data, error}>}
     */
    async registrar(email, password, metadata = {}) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata // Se guarda en raw_user_meta_data
            }
        })
        return { data, error }
    },

    /**
     * Iniciar sesión con email y contraseña
     * @param {string} email - Email del usuario
     * @param {string} password - Contraseña
     * @returns {Promise<{data, error}>}
     */
    async login(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })
        return { data, error }
    },

    /**
     * Iniciar sesión con proveedor OAuth (Google, GitHub, etc.)
     * @param {string} provider - Nombre del proveedor ('google', 'github', etc.)
     * @returns {Promise<{data, error}>}
     */
    async loginConProveedor(provider) {
        // En GitHub Pages, la URL puede ser https://usuario.github.io/repo/
        // window.location.origin solo devuelve https://usuario.github.io
        // Necesitamos window.location.pathname para incluir /repo/
        const redirectUrl = window.location.origin + window.location.pathname
        
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: redirectUrl
            }
        })
        return { data, error }
    },

    /**
     * Cerrar sesión del usuario actual
     * @returns {Promise<{error}>}
     */
    async logout() {
        const { error } = await supabase.auth.signOut()
        return { error }
    },

    /**
     * Eliminar la cuenta del usuario actual.
     * Borra todos los datos del usuario en las tablas de Supabase y cierra sesión.
     * @returns {Promise<{error}>}
     */
    async eliminarCuenta() {
        try {
            const user = await this.obtenerUsuario()
            if (!user) return { error: new Error('No hay usuario autenticado') }

            const uid = user.id

            // Eliminar datos de todas las tablas del usuario
            const tablas = ['transactions', 'categories', 'budgets', 'goals', 'profiles']
            for (const tabla of tablas) {
                const { error } = await supabase
                    .from(tabla)
                    .delete()
                    .eq('user_id', uid)
                if (error) console.warn(`Error eliminando ${tabla}:`, error.message)
            }

            // Cerrar sesión (la eliminación del auth.users record
            // requiere una Edge Function o el Admin API de Supabase)
            await supabase.auth.signOut()

            return { error: null }
        } catch (error) {
            console.error('Error eliminando cuenta:', error)
            return { error }
        }
    },

    /**
     * Obtener el usuario actual
     * @returns {Promise<object|null>} Usuario o null si no hay sesión
     */
    async obtenerUsuario() {
        const { data: { user } } = await supabase.auth.getUser()
        return user
    },

    /**
     * Obtener la sesión actual
     * @returns {Promise<object|null>} Sesión o null
     */
    async obtenerSesion() {
        const { data: { session } } = await supabase.auth.getSession()
        return session
    },

    /**
     * Escuchar cambios en el estado de autenticación
     * @param {function} callback - Función a ejecutar cuando cambie el estado
     * @returns {function} Función para cancelar la suscripción
     */
    onAuthStateChange(callback) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                callback(event, session)
            }
        )
        return () => subscription.unsubscribe()
    },

    /**
     * Enviar email de recuperación de contraseña
     * @param {string} email - Email del usuario
     * @returns {Promise<{data, error}>}
     */
    async recuperarPassword(email) {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/#/reset-password`
        })
        return { data, error }
    },

    /**
     * Actualizar contraseña del usuario
     * @param {string} newPassword - Nueva contraseña
     * @returns {Promise<{data, error}>}
     */
    async actualizarPassword(newPassword) {
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword
        })
        return { data, error }
    }
}

/**
 * Servicio de Base de Datos
 * Funciones helper para operaciones CRUD
 */
export const dbService = {

    // ----- TRANSACCIONES -----

    /**
     * Obtener todas las transacciones del usuario
     * @param {object} filtros - Filtros opcionales (tipo, fechaInicio, fechaFin, categoriaId)
     * @returns {Promise<{data, error}>}
     */
    async obtenerTransacciones(filtros = {}) {
        let query = supabase
            .from('transactions')
            .select(`
        *,
        category:categories(id, nombre, icono, color)
      `)
            .order('fecha', { ascending: false })

        // Aplicar filtros
        if (filtros.tipo) {
            query = query.eq('tipo', filtros.tipo)
        }
        if (filtros.fechaInicio) {
            query = query.gte('fecha', filtros.fechaInicio)
        }
        if (filtros.fechaFin) {
            query = query.lte('fecha', filtros.fechaFin)
        }
        if (filtros.categoriaId) {
            query = query.eq('category_id', filtros.categoriaId)
        }
        if (filtros.limite) {
            query = query.limit(filtros.limite)
        }

        const { data, error } = await query
        return { data, error }
    },

    /**
     * Crear una nueva transacción
     * @param {object} transaccion - Datos de la transacción
     * @returns {Promise<{data, error}>}
     */
    async crearTransaccion(transaccion) {
        const { data, error } = await supabase
            .from('transactions')
            .insert(transaccion)
            .select()
            .single()
        return { data, error }
    },

    /**
     * Actualizar una transacción existente
     * @param {string} id - ID de la transacción
     * @param {object} cambios - Campos a actualizar
     * @returns {Promise<{data, error}>}
     */
    async actualizarTransaccion(id, cambios) {
        const { data, error } = await supabase
            .from('transactions')
            .update({ ...cambios, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single()
        return { data, error }
    },

    /**
     * Eliminar una transacción
     * @param {string} id - ID de la transacción
     * @returns {Promise<{error}>}
     */
    async eliminarTransaccion(id) {
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id)
        return { error }
    },

    // ----- CATEGORÍAS -----

    /**
     * Obtener todas las categorías del usuario
     * @param {string} tipo - Filtrar por tipo ('ingreso' o 'gasto')
     * @returns {Promise<{data, error}>}
     */
    async obtenerCategorias(tipo = null) {
        let query = supabase
            .from('categories')
            .select('*')
            .order('nombre')

        if (tipo) {
            query = query.eq('tipo', tipo)
        }

        const { data, error } = await query
        return { data, error }
    },

    /**
     * Crear una nueva categoría
     * @param {object} categoria - Datos de la categoría
     * @returns {Promise<{data, error}>}
     */
    async crearCategoria(categoria) {
        // Transform Spanish field names to English column names for Supabase
        const supabaseData = {
            name: categoria.nombre || categoria.name,
            type: categoria.tipo || categoria.type,
            icon: categoria.icono || categoria.icon,
            color: categoria.color
        }
        const { data, error } = await supabase
            .from('categories')
            .insert(supabaseData)
            .select()
            .single()
        return { data, error }
    },

    /**
     * Actualizar una categoría
     * @param {string} id - ID de la categoría
     * @param {object} cambios - Campos a actualizar
     * @returns {Promise<{data, error}>}
     */
    async actualizarCategoria(id, cambios) {
        // Transform Spanish field names to English column names for Supabase
        const supabaseData = {
            updated_at: new Date().toISOString()
        }
        if (cambios.nombre !== undefined) supabaseData.name = cambios.nombre
        if (cambios.tipo !== undefined) supabaseData.type = cambios.tipo
        if (cambios.icono !== undefined) supabaseData.icon = cambios.icono
        if (cambios.color !== undefined) supabaseData.color = cambios.color

        const { data, error } = await supabase
            .from('categories')
            .update(supabaseData)
            .eq('id', id)
            .select()
            .single()
        return { data, error }
    },

    /**
     * Eliminar una categoría
     * @param {string} id - ID de la categoría
     * @returns {Promise<{error}>}
     */
    async eliminarCategoria(id) {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id)
        return { error }
    },

    // ----- PRESUPUESTOS -----

    /**
     * Obtener presupuestos del usuario
     * @param {number} mes - Mes (1-12)
     * @param {number} anio - Año
     * @returns {Promise<{data, error}>}
     */
    async obtenerPresupuestos(mes = null, anio = null) {
        let query = supabase
            .from('budgets')
            .select(`
        *,
        category:categories(id, nombre, icono, color)
      `)

        if (mes) query = query.eq('mes', mes)
        if (anio) query = query.eq('anio', anio)

        const { data, error } = await query
        return { data, error }
    },

    /**
     * Crear o actualizar un presupuesto
     * @param {object} presupuesto - Datos del presupuesto
     * @returns {Promise<{data, error}>}
     */
    async guardarPresupuesto(presupuesto) {
        const { data, error } = await supabase
            .from('budgets')
            .upsert(presupuesto, {
                onConflict: 'user_id,category_id,mes,anio'
            })
            .select()
            .single()
        return { data, error }
    },

    // ----- PERFIL -----

    /**
     * Obtener perfil del usuario actual
     * @returns {Promise<{data, error}>}
     */
    async obtenerPerfil() {
        const user = await authService.obtenerUsuario()
        if (!user) return { data: null, error: { message: 'No hay sesión activa' } }

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
        return { data, error }
    },

    /**
     * Actualizar perfil del usuario
     * @param {object} cambios - Campos a actualizar
     * @returns {Promise<{data, error}>}
     */
    async actualizarPerfil(cambios) {
        const user = await authService.obtenerUsuario()
        if (!user) return { data: null, error: { message: 'No hay sesión activa' } }

        const { data, error } = await supabase
            .from('profiles')
            .update({ ...cambios, updated_at: new Date().toISOString() })
            .eq('id', user.id)
            .select()
            .single()
        return { data, error }
    },

    // ----- ESTADÍSTICAS -----

    /**
     * Obtener resumen financiero del mes actual
     * @param {number} mes - Mes (1-12)
     * @param {number} anio - Año
     * @returns {Promise<object>}
     */
    async obtenerResumenMes(mes = null, anio = null) {
        const ahora = new Date()
        const mesActual = mes || ahora.getMonth() + 1
        const anioActual = anio || ahora.getFullYear()

        // Calcular primer y último día del mes
        const primerDia = `${anioActual}-${String(mesActual).padStart(2, '0')}-01`
        const ultimoDia = new Date(anioActual, mesActual, 0).getDate()
        const fechaFin = `${anioActual}-${String(mesActual).padStart(2, '0')}-${ultimoDia}`

        const { data, error } = await supabase
            .from('transactions')
            .select('tipo, monto')
            .gte('fecha', primerDia)
            .lte('fecha', fechaFin)

        if (error) return { error }

        const resumen = {
            ingresos: 0,
            gastos: 0,
            balance: 0,
            totalTransacciones: data.length
        }

        data.forEach(t => {
            if (t.tipo === 'ingreso') {
                resumen.ingresos += parseFloat(t.monto)
            } else {
                resumen.gastos += parseFloat(t.monto)
            }
        })

        resumen.balance = resumen.ingresos - resumen.gastos

        return { data: resumen, error: null }
    }
}

/**
 * Servicio de Storage (Archivos)
 * Funciones para subir, descargar y eliminar archivos
 */
export const storageService = {

    // Nombre del bucket de archivos
    BUCKET: 'archivos-transacciones',

    /**
     * Subir un archivo
     * @param {File} archivo - Archivo a subir
     * @param {string} carpeta - Carpeta dentro del bucket (normalmente el userId)
     * @returns {Promise<{url, path, error}>}
     */
    async subirArchivo(archivo, carpeta) {
        // Generar nombre único para el archivo
        const extension = archivo.name.split('.').pop()
        const nombreUnico = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${extension}`
        const rutaArchivo = `${carpeta}/${nombreUnico}`

        // Subir archivo
        const { data, error } = await supabase.storage
            .from(this.BUCKET)
            .upload(rutaArchivo, archivo, {
                cacheControl: '3600',
                upsert: false
            })

        if (error) return { url: null, path: null, error }

        // Generar URL firmada (válida por 1 año)
        const { data: urlData } = await supabase.storage
            .from(this.BUCKET)
            .createSignedUrl(rutaArchivo, 60 * 60 * 24 * 365) // 1 año

        return {
            url: urlData?.signedUrl || null,
            path: rutaArchivo,
            error: null
        }
    },

    /**
     * Obtener URL firmada de un archivo
     * @param {string} path - Ruta del archivo
     * @param {number} expiresIn - Tiempo de expiración en segundos
     * @returns {Promise<{url, error}>}
     */
    async obtenerUrl(path, expiresIn = 3600) {
        const { data, error } = await supabase.storage
            .from(this.BUCKET)
            .createSignedUrl(path, expiresIn)
        return { url: data?.signedUrl, error }
    },

    /**
     * Eliminar un archivo
     * @param {string} path - Ruta del archivo
     * @returns {Promise<{error}>}
     */
    async eliminarArchivo(path) {
        const { error } = await supabase.storage
            .from(this.BUCKET)
            .remove([path])
        return { error }
    },

    /**
     * Descargar un archivo
     * @param {string} path - Ruta del archivo
     * @returns {Promise<{data, error}>}
     */
    async descargarArchivo(path) {
        const { data, error } = await supabase.storage
            .from(this.BUCKET)
            .download(path)
        return { data, error }
    }
}

// Exportar cliente por defecto
export default supabase
