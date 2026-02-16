/**
 * =====================================================
 * FINANZAPRO - Utilidades y Helpers
 * =====================================================
 * Funciones de utilidad reutilizables en toda la app
 */

/**
 * Formatear cantidad como moneda
 * @param {number} cantidad - Cantidad a formatear
 * @param {string} moneda - Código de moneda (EUR, USD, etc.)
 * @returns {string} Cantidad formateada
 */
export function formatearMoneda(cantidad, moneda = 'EUR') {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: moneda,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(cantidad || 0)
}

/**
 * Formatear fecha en formato legible
 * @param {string|Date} fecha - Fecha a formatear
 * @param {object} opciones - Opciones de formato
 * @returns {string} Fecha formateada
 */
export function formatearFecha(fecha, opciones = {}) {
    const date = new Date(fecha)
    const hoy = new Date()
    const ayer = new Date(hoy)
    ayer.setDate(ayer.getDate() - 1)

    // Verificar si es hoy o ayer
    if (date.toDateString() === hoy.toDateString()) {
        return 'Hoy'
    }
    if (date.toDateString() === ayer.toDateString()) {
        return 'Ayer'
    }

    // Formato por defecto
    const formatoDefault = {
        day: 'numeric',
        month: 'short',
        ...opciones
    }

    return date.toLocaleDateString('es-ES', formatoDefault)
}

/**
 * Formatear fecha para input de tipo date
 * @param {string|Date} fecha - Fecha a formatear
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export function formatearFechaInput(fecha = new Date()) {
    const date = new Date(fecha)
    return date.toISOString().split('T')[0]
}

/**
 * Obtener saludo según la hora del día
 * @returns {string} Saludo apropiado
 */
export function obtenerSaludo() {
    const hora = new Date().getHours()

    if (hora >= 5 && hora < 12) {
        return 'Buenos días'
    } else if (hora >= 12 && hora < 20) {
        return 'Buenas tardes'
    } else {
        return 'Buenas noches'
    }
}

/**
 * Generar ID único
 * @returns {string} UUID v4
 */
export function generarId() {
    return crypto.randomUUID()
}

/**
 * Debounce - Retrasar ejecución de función
 * @param {function} func - Función a ejecutar
 * @param {number} wait - Milisegundos de espera
 * @returns {function} Función con debounce
 */
export function debounce(func, wait = 300) {
    let timeout
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout)
            func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}

/**
 * Throttle - Limitar frecuencia de ejecución
 * @param {function} func - Función a ejecutar
 * @param {number} limit - Milisegundos entre ejecuciones
 * @returns {function} Función con throttle
 */
export function throttle(func, limit = 300) {
    let inThrottle
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args)
            inThrottle = true
            setTimeout(() => inThrottle = false, limit)
        }
    }
}

/**
 * Validar email
 * @param {string} email - Email a validar
 * @returns {boolean} Es válido o no
 */
export function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
}

/**
 * Truncar texto
 * @param {string} texto - Texto a truncar
 * @param {number} longitud - Longitud máxima
 * @returns {string} Texto truncado
 */
export function truncar(texto, longitud = 50) {
    if (!texto || texto.length <= longitud) return texto
    return texto.substring(0, longitud) + '...'
}

/**
 * Capitalizar primera letra
 * @param {string} texto - Texto a capitalizar
 * @returns {string} Texto capitalizado
 */
export function capitalizar(texto) {
    if (!texto) return ''
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase()
}

/**
 * Obtener iniciales de un nombre
 * @param {string} nombre - Nombre completo
 * @returns {string} Iniciales (máximo 2)
 */
export function obtenerIniciales(nombre) {
    if (!nombre) return '?'
    return nombre
        .split(' ')
        .map(palabra => palabra.charAt(0))
        .slice(0, 2)
        .join('')
        .toUpperCase()
}

/**
 * Calcular porcentaje
 * @param {number} valor - Valor actual
 * @param {number} total - Total
 * @returns {number} Porcentaje (0-100)
 */
export function calcularPorcentaje(valor, total) {
    if (!total || total === 0) return 0
    return Math.round((valor / total) * 100)
}

/**
 * Obtener nombre del mes
 * @param {number} mes - Número del mes (1-12)
 * @returns {string} Nombre del mes
 */
export function obtenerNombreMes(mes) {
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]
    return meses[(mes - 1) % 12]
}

/**
 * Obtener nombre del mes (índice 0-11)
 * @param {number} mes - Índice del mes (0-11)
 * @returns {string} Nombre del mes
 */
export function obtenerMes(mes) {
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]
    return meses[mes % 12]
}

/**
 * Obtener rango de fechas del mes actual
 * @param {number} mes - Mes (1-12)
 * @param {number} anio - Año
 * @returns {object} { inicio, fin }
 */
export function obtenerRangoMes(mes = null, anio = null) {
    const ahora = new Date()
    const m = mes || ahora.getMonth() + 1
    const a = anio || ahora.getFullYear()

    const inicio = `${a}-${String(m).padStart(2, '0')}-01`
    const ultimoDia = new Date(a, m, 0).getDate()
    const fin = `${a}-${String(m).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`

    return { inicio, fin }
}

/**
 * Agrupar array por propiedad
 * @param {Array} array - Array a agrupar
 * @param {string} propiedad - Propiedad por la cual agrupar
 * @returns {object} Objeto agrupado
 */
export function agruparPor(array, propiedad) {
    return array.reduce((acc, item) => {
        const key = item[propiedad]
        if (!acc[key]) {
            acc[key] = []
        }
        acc[key].push(item)
        return acc
    }, {})
}

/**
 * Ordenar array de objetos
 * @param {Array} array - Array a ordenar
 * @param {string} propiedad - Propiedad por la cual ordenar
 * @param {string} direccion - 'asc' o 'desc'
 * @returns {Array} Array ordenado
 */
export function ordenarPor(array, propiedad, direccion = 'asc') {
    return [...array].sort((a, b) => {
        let valorA = a[propiedad]
        let valorB = b[propiedad]

        // Manejar strings
        if (typeof valorA === 'string') {
            valorA = valorA.toLowerCase()
            valorB = valorB.toLowerCase()
        }

        if (direccion === 'asc') {
            return valorA > valorB ? 1 : -1
        } else {
            return valorA < valorB ? 1 : -1
        }
    })
}

/**
 * Esperar un tiempo determinado
 * @param {number} ms - Milisegundos a esperar
 * @returns {Promise} Promesa que se resuelve después del tiempo
 */
export function esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Copiar texto al portapapeles
 * @param {string} texto - Texto a copiar
 * @returns {Promise<boolean>} Éxito o fallo
 */
export async function copiarAlPortapapeles(texto) {
    try {
        await navigator.clipboard.writeText(texto)
        return true
    } catch (error) {
        console.error('Error al copiar:', error)
        return false
    }
}

/**
 * Descargar datos como archivo
 * @param {object} datos - Datos a descargar
 * @param {string} nombreArchivo - Nombre del archivo
 * @param {string} tipo - Tipo MIME
 */
export function descargarArchivo(datos, nombreArchivo, tipo = 'application/json') {
    const blob = new Blob([JSON.stringify(datos, null, 2)], { type: tipo })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = nombreArchivo
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}

/**
 * Colores predefinidos para categorías
 */
export const COLORES_CATEGORIA = [
    '#ef4444', // Rojo
    '#f97316', // Naranja
    '#f59e0b', // Ámbar
    '#eab308', // Amarillo
    '#84cc16', // Lima
    '#22c55e', // Verde
    '#10b981', // Esmeralda
    '#14b8a6', // Teal
    '#06b6d4', // Cyan
    '#0ea5e9', // Celeste
    '#3b82f6', // Azul
    '#6366f1', // Índigo
    '#8b5cf6', // Violeta
    '#a855f7', // Púrpura
    '#d946ef', // Fucsia
    '#ec4899', // Rosa
    '#f43f5e', // Rose
    '#6b7280'  // Gris
]

/**
 * Iconos predefinidos para categorías
 */
export const ICONOS_CATEGORIA = [
    '🍔', '🛒', '🚗', '🏠', '💡', '💧', '📱', '💻',
    '👕', '👟', '💄', '🏥', '💊', '🏋️', '🎬', '🎮',
    '📚', '✈️', '🏨', '🎁', '💰', '💳', '📈', '🏦',
    '🍺', '☕', '🍕', '🎵', '🎨', '🐕', '👶', '📦'
]

export default {
    formatearMoneda,
    formatearFecha,
    formatearFechaInput,
    obtenerSaludo,
    generarId,
    debounce,
    throttle,
    validarEmail,
    truncar,
    capitalizar,
    obtenerIniciales,
    calcularPorcentaje,
    obtenerNombreMes,
    obtenerRangoMes,
    agruparPor,
    ordenarPor,
    esperar,
    copiarAlPortapapeles,
    descargarArchivo,
    COLORES_CATEGORIA,
    ICONOS_CATEGORIA
}
