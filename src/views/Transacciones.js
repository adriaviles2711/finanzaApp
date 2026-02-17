/**
 * =====================================================
 * FINANZAPRO - Vista Transacciones
 * =====================================================
 * Listado de transacciones con filtros y búsqueda
 */

import { dataManager } from '../services/dataManager.js'
import { formatearMoneda, formatearFecha, agruparPor } from '../utils/helpers.js'

/**
 * Renderizar vista de Transacciones
 * @returns {Promise<string>} HTML de la vista
 */
export async function TransaccionesView() {
  const transacciones = await dataManager.obtenerTransacciones()
  const categorias = await dataManager.obtenerCategorias()

  // Agrupar por fecha
  const transaccionesPorFecha = agruparPorFecha(transacciones)

  return `
    <div class="space-y-6 pb-20 md:pb-0 animate-fade-in">
      
      <!-- Header con filtros -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-dark-900 dark:text-white">Transacciones</h1>
          <p class="text-dark-500 dark:text-dark-400">${transacciones.length} transacciones registradas</p>
        </div>
        
        <a href="#/nueva-transaccion" class="btn-primary">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nueva transacción
        </a>
        <button id="btn-importar-csv" class="btn-secondary ml-2" title="Importar CSV">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
        </button>
        <input type="file" id="file-import-csv" accept=".csv" class="hidden" />
      </div>
      
      <!-- Filtros -->
      <div class="card">
        <div class="flex flex-wrap gap-3">
          <!-- Filtro por tipo -->
          <select id="filtro-tipo" class="input w-auto min-w-[140px]">
            <option value="">Todos los tipos</option>
            <option value="ingreso">💰 Ingresos</option>
            <option value="gasto">💸 Gastos</option>
          </select>
          
          <!-- Filtro por categoría -->
          <select id="filtro-categoria" class="input w-auto min-w-[160px]">
            <option value="">Todas las categorías</option>
            ${categorias.map(cat => `
              <option value="${cat.id}">${cat.icono} ${cat.nombre}</option>
            `).join('')}
          </select>
          
          <!-- Filtro por fecha -->
          <input type="month" id="filtro-mes" class="input w-auto" value="${new Date().toISOString().slice(0, 7)}">
          
          <!-- Búsqueda -->
          <div class="relative flex-1 min-w-[200px]">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" id="buscar-transaccion" class="input pl-10" placeholder="Buscar transacción...">
          </div>
        </div>
      </div>
      
      <!-- Lista de transacciones -->
      <div id="lista-transacciones" class="space-y-4">
        ${transacciones.length === 0 ? `
          <div class="card">
            <div class="empty-state">
              <div class="empty-state-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 class="empty-state-title">No hay transacciones</h3>
              <p class="empty-state-text">Comienza a registrar tus ingresos y gastos para llevar un control de tus finanzas.</p>
              <a href="#/nueva-transaccion" class="btn-primary mt-4">
                Añadir primera transacción
              </a>
            </div>
          </div>
        ` : renderizarTransaccionesPorFecha(transaccionesPorFecha)}
      </div>
      
    </div>
  `
}

/**
 * Agrupar transacciones por fecha
 * @param {Array} transacciones - Lista de transacciones
 * @returns {object} Transacciones agrupadas
 */
function agruparPorFecha(transacciones) {
  const grupos = {}

  transacciones.forEach(t => {
    const fecha = t.fecha || new Date().toISOString().split('T')[0]
    if (!grupos[fecha]) {
      grupos[fecha] = []
    }
    grupos[fecha].push(t)
  })

  return grupos
}

/**
 * Renderizar transacciones agrupadas por fecha
 * @param {object} grupos - Transacciones agrupadas
 * @returns {string} HTML
 */
function renderizarTransaccionesPorFecha(grupos) {
  const fechasOrdenadas = Object.keys(grupos).sort((a, b) => new Date(b) - new Date(a))

  return fechasOrdenadas.map(fecha => {
    const transacciones = grupos[fecha]
    const totalDia = transacciones.reduce((acc, t) => {
      return acc + (t.tipo === 'ingreso' ? parseFloat(t.monto) : -parseFloat(t.monto))
    }, 0)

    return `
      <div class="card">
        <!-- Cabecera del día -->
        <div class="flex items-center justify-between mb-4 pb-3 border-b border-dark-100 dark:border-dark-700">
          <div>
            <h3 class="font-semibold text-dark-900 dark:text-white">${formatearFecha(fecha, { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
            <p class="text-sm text-dark-500 dark:text-dark-400">${transacciones.length} transacción${transacciones.length > 1 ? 'es' : ''}</p>
          </div>
          <span class="font-semibold ${totalDia >= 0 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}">
            ${totalDia >= 0 ? '+' : ''}${formatearMoneda(totalDia)}
          </span>
        </div>
        
        <!-- Lista de transacciones del día -->
        <div class="divide-y divide-dark-100 dark:divide-dark-700 -mx-1">
          ${transacciones.map(t => `
            <a href="#/editar-transaccion/${t.id}" class="transaction-item group">
              <span class="transaction-icon" style="background-color: ${t.category?.color || '#6b7280'}20;">
                ${t.category?.icono || '📦'}
              </span>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-dark-900 dark:text-white truncate">
                  ${t.descripcion || t.category?.nombre || 'Sin descripción'}
                </p>
                <p class="text-sm text-dark-500 dark:text-dark-400">
                  ${t.category?.nombre || 'Sin categoría'}
                  ${t.archivo_nombre ? `<span class="ml-2">📎 ${t.archivo_nombre}</span>` : ''}
                </p>
              </div>
              <div class="text-right">
                <span class="font-semibold ${t.tipo === 'ingreso' ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}">
                  ${t.tipo === 'ingreso' ? '+' : '-'}${formatearMoneda(t.monto)}
                </span>
                <svg class="w-4 h-4 text-dark-400 mt-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </a>
          `).join('')}
        </div>
      </div>
    `
  }).join('')
}

/**
 * Inicializar eventos de filtros
 */
export function initTransaccionesEvents() {
  const filtroTipo = document.getElementById('filtro-tipo')
  const filtroCategoria = document.getElementById('filtro-categoria')
  const filtroMes = document.getElementById('filtro-mes')
  const buscar = document.getElementById('buscar-transaccion')

  const aplicarFiltros = async () => {
    const tipo = filtroTipo?.value || ''
    const categoriaId = filtroCategoria?.value || ''
    const mes = filtroMes?.value || ''
    const textoBusqueda = buscar?.value.toLowerCase() || ''

    let filtros = {}

    if (tipo) filtros.tipo = tipo
    if (categoriaId) filtros.categoriaId = categoriaId

    if (mes) {
      const [anio, m] = mes.split('-')
      const ultimoDia = new Date(parseInt(anio), parseInt(m), 0).getDate()
      filtros.fechaInicio = `${anio}-${m}-01`
      filtros.fechaFin = `${anio}-${m}-${ultimoDia}`
    }

    let transacciones = await dataManager.obtenerTransacciones(filtros)

    // Filtrar por texto de búsqueda
    if (textoBusqueda) {
      transacciones = transacciones.filter(t =>
        (t.descripcion?.toLowerCase().includes(textoBusqueda)) ||
        (t.category?.nombre?.toLowerCase().includes(textoBusqueda))
      )
    }

    // Renderizar resultados
    const container = document.getElementById('lista-transacciones')
    if (container) {
      if (transacciones.length === 0) {
        container.innerHTML = `
          <div class="card">
            <div class="empty-state">
              <div class="empty-state-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 class="empty-state-title">Sin resultados</h3>
              <p class="empty-state-text">No se encontraron transacciones con los filtros aplicados.</p>
            </div>
          </div>
        `
      } else {
        container.innerHTML = renderizarTransaccionesPorFecha(agruparPorFecha(transacciones))
      }
    }
  }

  // Eventos de filtros
  filtroTipo?.addEventListener('change', aplicarFiltros)
  filtroCategoria?.addEventListener('change', aplicarFiltros)
  filtroMes?.addEventListener('change', aplicarFiltros)
  buscar?.addEventListener('input', aplicarFiltros)

  // Importar CSV
  document.getElementById('btn-importar-csv')?.addEventListener('click', () => {
    document.getElementById('file-import-csv')?.click()
  })

  document.getElementById('file-import-csv')?.addEventListener('change', async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (confirm('¿Importar transacciones desde este archivo CSV?')) {
      const reader = new FileReader()
      reader.onload = async (event) => {
        try {
          const csvText = event.target.result
          window.showToast?.('Importando transacciones...', 'info')

          const resumen = await dataManager.importarTransaccionesCSV(csvText)

          if (resumen.transacciones > 0) {
            window.showToast?.(`¡Éxito! ${resumen.transacciones} transacciones importadas.`, 'success')
            setTimeout(() => window.location.reload(), 1500)
          } else {
            window.showToast?.('No se pudieron importar transacciones. Revisa el formato.', 'warning')
          }
        } catch (error) {
          console.error('Error importando CSV:', error)
          window.showToast?.('Error al procesar el archivo CSV', 'error')
        }
      }
      reader.readAsText(file)
    }
    e.target.value = ''
  })
}

export default TransaccionesView
