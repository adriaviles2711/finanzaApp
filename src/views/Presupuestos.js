/**
 * =====================================================
 * FINANZAPRO - Vista Presupuestos
 * =====================================================
 * Gestión de presupuestos mensuales por categoría
 */

import { dataManager } from '../services/dataManager.js'
import { formatearMoneda, calcularPorcentaje, obtenerNombreMes } from '../utils/helpers.js'

/**
 * Renderizar vista de Presupuestos
 * @returns {Promise<string>} HTML de la vista
 */
export async function PresupuestosView() {
  const ahora = new Date()
  const mes = ahora.getMonth() + 1
  const anio = ahora.getFullYear()

  const presupuestos = await dataManager.obtenerPresupuestos(mes, anio)
  const gastosPorCategoria = await dataManager.obtenerGastosPorCategoria(mes, anio)
  const categorias = await dataManager.obtenerCategorias('gasto')

  // Calcular totales
  const totalPresupuestado = presupuestos.reduce((acc, p) => acc + parseFloat(p.monto_limite), 0)
  const totalGastado = gastosPorCategoria.reduce((acc, g) => acc + g.total, 0)

  return `
    <div class="space-y-6 pb-20 md:pb-0 animate-fade-in">
      
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-dark-900 dark:text-white">Presupuestos</h1>
          <p class="text-dark-500 dark:text-dark-400">${obtenerNombreMes(mes)} ${anio}</p>
        </div>
        
        <button id="btn-nuevo-presupuesto" class="btn-primary">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo presupuesto
        </button>
      </div>
      
      <!-- Resumen general -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="card">
          <div class="flex items-center gap-3">
            <span class="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </span>
            <div>
              <p class="text-sm text-dark-500 dark:text-dark-400">Presupuestado</p>
              <p class="text-xl font-bold text-dark-900 dark:text-white">${formatearMoneda(totalPresupuestado)}</p>
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="flex items-center gap-3">
            <span class="w-12 h-12 bg-danger-100 dark:bg-danger-900/30 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-danger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </span>
            <div>
              <p class="text-sm text-dark-500 dark:text-dark-400">Gastado</p>
              <p class="text-xl font-bold text-dark-900 dark:text-white">${formatearMoneda(totalGastado)}</p>
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="flex items-center gap-3">
            <span class="w-12 h-12 ${totalPresupuestado - totalGastado >= 0 ? 'bg-success-100 dark:bg-success-900/30' : 'bg-danger-100 dark:bg-danger-900/30'} rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 ${totalPresupuestado - totalGastado >= 0 ? 'text-success-500' : 'text-danger-500'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <div>
              <p class="text-sm text-dark-500 dark:text-dark-400">Disponible</p>
              <p class="text-xl font-bold ${totalPresupuestado - totalGastado >= 0 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}">
                ${formatearMoneda(totalPresupuestado - totalGastado)}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Lista de presupuestos -->
      <div class="card">
        <h3 class="font-semibold text-dark-900 dark:text-white mb-4">Presupuestos por categoría</h3>
        
        ${presupuestos.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 class="empty-state-title">Sin presupuestos</h3>
            <p class="empty-state-text">Crea presupuestos para controlar tus gastos por categoría.</p>
          </div>
        ` : `
          <div class="space-y-4">
            ${presupuestos.map(p => {
    const gasto = gastosPorCategoria.find(g => g.id === p.category_id)
    const gastado = gasto?.total || 0
    const porcentaje = calcularPorcentaje(gastado, p.monto_limite)
    const excedido = porcentaje > 100

    return `
                <div class="p-4 bg-dark-50 dark:bg-dark-800/50 rounded-xl">
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-3">
                      <span class="text-2xl">${p.category?.icono || '📦'}</span>
                      <div>
                        <p class="font-medium text-dark-900 dark:text-white">${p.category?.nombre || 'Sin categoría'}</p>
                        <p class="text-sm text-dark-500 dark:text-dark-400">
                          ${formatearMoneda(gastado)} de ${formatearMoneda(p.monto_limite)}
                        </p>
                      </div>
                    </div>
                    <div class="text-right">
                      <span class="badge ${excedido ? 'badge-danger' : porcentaje > 80 ? 'badge-warning' : 'badge-success'}">
                        ${porcentaje}%
                      </span>
                    </div>
                  </div>
                  <div class="h-3 bg-dark-200 dark:bg-dark-700 rounded-full overflow-hidden">
                    <div 
                      class="h-full rounded-full transition-all duration-500 ${excedido ? 'bg-danger-500' : porcentaje > 80 ? 'bg-warning-500' : 'bg-success-500'}" 
                      style="width: ${Math.min(porcentaje, 100)}%"
                    ></div>
                  </div>
                  ${excedido ? `
                    <p class="text-sm text-danger-600 dark:text-danger-400 mt-2 flex items-center gap-1">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Has excedido este presupuesto en ${formatearMoneda(gastado - p.monto_limite)}
                    </p>
                  ` : ''}
                </div>
              `
  }).join('')}
          </div>
        `}
      </div>
      
      <!-- Modal para nuevo presupuesto -->
      <div id="modal-presupuesto" class="modal-overlay hidden">
        <div class="modal-content p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-dark-900 dark:text-white">Nuevo Presupuesto</h3>
            <button id="btn-cerrar-modal" class="btn-icon">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form id="form-presupuesto" class="space-y-4">
            <div>
              <label for="presupuesto-categoria" class="label">Categoría</label>
              <select id="presupuesto-categoria" class="input" required>
                <option value="">Selecciona una categoría</option>
                ${categorias.map(cat => `
                  <option value="${cat.id}">${cat.icono} ${cat.nombre}</option>
                `).join('')}
              </select>
            </div>
            
            <div>
              <label for="presupuesto-monto" class="label">Límite mensual</label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500">€</span>
                <input 
                  type="number" 
                  id="presupuesto-monto" 
                  class="input pl-10"
                  placeholder="0.00"
                  step="0.01"
                  min="1"
                  required
                >
              </div>
            </div>
            
            <div class="flex gap-3 pt-4">
              <button type="button" id="btn-cancelar-modal" class="btn-secondary flex-1">Cancelar</button>
              <button type="submit" class="btn-primary flex-1">Guardar</button>
            </div>
          </form>
        </div>
      </div>
      
    </div>
  `
}

/**
 * Inicializar eventos
 */
export function initPresupuestosEvents() {
  const modal = document.getElementById('modal-presupuesto')
  const btnAbrir = document.getElementById('btn-nuevo-presupuesto')
  const btnCerrar = document.getElementById('btn-cerrar-modal')
  const btnCancelar = document.getElementById('btn-cancelar-modal')
  const form = document.getElementById('form-presupuesto')

  const abrirModal = () => {
    // Move modal to body for full-screen backdrop coverage
    if (modal && modal.parentElement !== document.body) {
      document.body.appendChild(modal)
    }
    modal?.classList.remove('hidden')
  }
  const cerrarModal = () => modal?.classList.add('hidden')

  btnAbrir?.addEventListener('click', abrirModal)
  btnCerrar?.addEventListener('click', cerrarModal)
  btnCancelar?.addEventListener('click', cerrarModal)

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) cerrarModal()
  })

  form?.addEventListener('submit', async (e) => {
    e.preventDefault()

    const ahora = new Date()
    const datos = {
      category_id: document.getElementById('presupuesto-categoria').value,
      monto_limite: parseFloat(document.getElementById('presupuesto-monto').value),
      mes: ahora.getMonth() + 1,
      anio: ahora.getFullYear(),
      periodo: 'mensual'
    }

    try {
      await dataManager.guardarPresupuesto(datos)
      cerrarModal()
      // Recargar la vista
      window.location.reload()
    } catch (error) {
      console.error('Error guardando presupuesto:', error)
      alert('Error al guardar el presupuesto')
    }
  })
}


export default PresupuestosView
