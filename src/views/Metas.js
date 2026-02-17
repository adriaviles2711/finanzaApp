/**
 * =====================================================
 * FINANZAPRO - Vista Metas Financieras
 * =====================================================
 * Gestión de objetivos de ahorro con seguimiento visual
 */

import { dataManager } from '../services/dataManager.js'
import { formatearMoneda } from '../utils/helpers.js'
import { t } from '../utils/i18n.js'
import { COLORES_CATEGORIA, ICONOS_CATEGORIA } from '../utils/helpers.js'
import Router from '../router/index.js'

/**
 * Renderizar vista de Metas
 * @returns {Promise<string>} HTML de la vista
 */
export async function MetasView() {
  const metas = await dataManager.obtenerMetas()

  return `
    <div class="max-w-4xl mx-auto space-y-6 pb-24 md:pb-8 animate-fade-in">

      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-dark-900 dark:text-white">${t('goals.title')}</h1>
          <p class="text-dark-500 dark:text-dark-400 mt-1">${t('goals.subtitle')}</p>
        </div>
        <button id="btn-nueva-meta" class="btn-primary">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          ${t('goals.newGoal')}
        </button>
      </div>

      <!-- Lista de metas -->
      <div class="grid gap-4 md:grid-cols-2">
        ${metas.length > 0 ? metas.map(meta => {
    const porcentaje = meta.monto_objetivo > 0 ? Math.min(100, Math.round((meta.monto_actual / meta.monto_objetivo) * 100)) : 0
    const completada = porcentaje >= 100
    const restante = Math.max(0, meta.monto_objetivo - meta.monto_actual)

    // Calcular días restantes
    let diasRestantes = null
    if (meta.fecha_limite) {
      const hoy = new Date()
      const limite = new Date(meta.fecha_limite)
      diasRestantes = Math.ceil((limite - hoy) / (1000 * 60 * 60 * 24))
    }

    const statusClass = completada ? 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800' : 'bg-white dark:bg-dark-900 border-dark-100 dark:border-dark-800'
    const barColor = completada ? 'from-success-400 to-success-500' : porcentaje > 60 ? 'from-primary-400 to-primary-500' : porcentaje > 30 ? 'from-warning-400 to-warning-500' : 'from-danger-400 to-danger-500'

    return `
            <div class="card group hover:scale-[1.02] transition-all duration-300 ${statusClass}" data-meta-id="${meta.id}">
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-xl" style="background: ${meta.color || '#6366f1'}20; color: ${meta.color || '#6366f1'}">
                    ${meta.icono || '🎯'}
                  </div>
                  <div>
                    <h3 class="font-semibold text-dark-900 dark:text-white">${meta.nombre}</h3>
                    ${completada
        ? `<span class="text-sm text-success-600 dark:text-success-400 font-medium">${t('goals.completed')}</span>`
        : diasRestantes !== null
          ? `<span class="text-sm ${diasRestantes < 30 ? 'text-warning-600 dark:text-warning-400' : 'text-dark-500 dark:text-dark-400'}">${diasRestantes > 0 ? `${diasRestantes} ${t('goals.daysLeft')}` : t('goals.behindSchedule')}</span>`
          : ''
      }
                  </div>
                </div>
                <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button class="btn-icon btn-agregar-fondos" data-id="${meta.id}" title="${t('goals.addMoney')}">
                    <svg class="w-4 h-4 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v12m6-6H6" />
                    </svg>
                  </button>
                  <button class="btn-icon btn-editar-meta" data-id="${meta.id}" title="${t('common.edit')}">
                    <svg class="w-4 h-4 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button class="btn-icon btn-eliminar-meta" data-id="${meta.id}" title="${t('common.delete')}">
                    <svg class="w-4 h-4 text-danger-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Progress -->
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-dark-600 dark:text-dark-400">${formatearMoneda(meta.monto_actual)}</span>
                  <span class="font-semibold text-dark-900 dark:text-white">${formatearMoneda(meta.monto_objetivo)}</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill bg-gradient-to-r ${barColor}" style="width: ${porcentaje}%"></div>
                </div>
                <div class="flex justify-between text-xs">
                  <span class="text-dark-500">${porcentaje}%</span>
                  ${!completada ? `<span class="text-dark-500">${t('goals.remaining')}: ${formatearMoneda(restante)}</span>` : ''}
                </div>
              </div>
            </div>
          `
  }).join('') : `
          <!-- Empty State -->
          <div class="col-span-2 empty-state">
            <div class="empty-state-icon">🎯</div>
            <h3 class="empty-state-title">${t('goals.noGoals')}</h3>
            <p class="empty-state-text">${t('goals.noGoalsDesc')}</p>
            <button id="btn-primera-meta" class="btn-primary mt-6">
              ${t('goals.createFirst')}
            </button>
          </div>
        `}
      </div>

      <!-- Modal Nueva/Editar Meta -->
      <div id="modal-meta" class="modal-overlay hidden">
        <div class="modal-content p-6 space-y-5">
          <div class="flex items-center justify-between">
            <h2 id="modal-meta-titulo" class="text-xl font-bold text-dark-900 dark:text-white">${t('goals.newGoal')}</h2>
            <button id="cerrar-modal-meta" class="btn-icon">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form id="form-meta" class="space-y-4">
            <input type="hidden" id="meta-id" value="">

            <div>
              <label class="label">${t('goals.name')}</label>
              <input type="text" id="meta-nombre" class="input" placeholder="${t('goals.namePlaceholder')}" required>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label">${t('goals.targetAmount')}</label>
                <input type="number" id="meta-objetivo" class="input" placeholder="0.00" step="0.01" min="0" required>
              </div>
              <div>
                <label class="label">${t('goals.currentAmount')}</label>
                <input type="number" id="meta-actual" class="input" placeholder="0.00" step="0.01" min="0" value="0">
              </div>
            </div>

            <div>
              <label class="label">${t('goals.deadline')}</label>
              <input type="date" id="meta-fecha" class="input">
            </div>

            <div>
              <label class="label">${t('goals.icon')}</label>
              <div class="flex flex-wrap gap-2" id="meta-iconos">
                ${['🎯', '🏖️', '🚗', '🏠', '💰', '📚', '🎓', '💍', '🎮', '✈️', '🏋️', '🎸'].map((icon, i) => `
                  <label class="cursor-pointer">
                    <input type="radio" name="meta-icono" value="${icon}" class="hidden" ${i === 0 ? 'checked' : ''}>
                    <span class="inline-flex items-center justify-center w-10 h-10 rounded-xl border-2 border-dark-200 dark:border-dark-700 text-xl hover:border-primary-400 transition-colors peer-checked:border-primary-500">${icon}</span>
                  </label>
                `).join('')}
              </div>
            </div>

            <div>
              <label class="label">${t('goals.color')}</label>
              <div class="flex flex-wrap gap-2" id="meta-colores">
                ${COLORES_CATEGORIA.slice(0, 10).map((color, i) => `
                  <label class="cursor-pointer">
                    <input type="radio" name="meta-color" value="${color}" class="hidden" ${i === 0 ? 'checked' : ''}>
                    <span class="color-option" style="background: ${color}"></span>
                  </label>
                `).join('')}
              </div>
            </div>

            <button type="submit" class="btn-primary w-full">${t('goals.save')}</button>
          </form>
        </div>
      </div>

      <!-- Modal Agregar Fondos -->
      <div id="modal-fondos" class="modal-overlay hidden">
        <div class="modal-content p-6 space-y-5">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold text-dark-900 dark:text-white">${t('goals.addMoney')}</h2>
            <button id="cerrar-modal-fondos" class="btn-icon">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form id="form-fondos" class="space-y-4">
            <input type="hidden" id="fondos-meta-id" value="">
            <div>
              <label class="label">${t('goals.addAmount')}</label>
              <input type="number" id="fondos-monto" class="input" placeholder="0.00" step="0.01" min="0.01" required>
            </div>
            <button type="submit" class="btn-primary w-full">${t('goals.addMoney')}</button>
          </form>
        </div>
      </div>
    </div>
  `
}

/**
 * Inicializar eventos de la vista Metas
 */
export function initMetasEvents() {
  const btnNueva = document.getElementById('btn-nueva-meta')
  const btnPrimera = document.getElementById('btn-primera-meta')
  const modal = document.getElementById('modal-meta')
  const cerrarModal = document.getElementById('cerrar-modal-meta')
  const form = document.getElementById('form-meta')
  const modalFondos = document.getElementById('modal-fondos')
  const cerrarFondos = document.getElementById('cerrar-modal-fondos')
  const formFondos = document.getElementById('form-fondos')

  // Abrir modal nueva meta
  const abrirModal = () => {
    document.getElementById('meta-id').value = ''
    form.reset()
    document.getElementById('modal-meta-titulo').textContent = t('goals.newGoal')
    modal?.classList.remove('hidden')
  }

  btnNueva?.addEventListener('click', abrirModal)
  btnPrimera?.addEventListener('click', abrirModal)
  cerrarModal?.addEventListener('click', () => modal?.classList.add('hidden'))
  modal?.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden') })

  // Guardar meta
  form?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const id = document.getElementById('meta-id').value
    const datos = {
      nombre: document.getElementById('meta-nombre').value,
      monto_objetivo: parseFloat(document.getElementById('meta-objetivo').value),
      monto_actual: parseFloat(document.getElementById('meta-actual').value) || 0,
      fecha_limite: document.getElementById('meta-fecha').value || null,
      icono: document.querySelector('input[name="meta-icono"]:checked')?.value || '🎯',
      color: document.querySelector('input[name="meta-color"]:checked')?.value || '#6366f1',
    }

    try {
      if (id) {
        await dataManager.actualizarMeta(id, datos)
      } else {
        await dataManager.crearMeta(datos)
      }
      window.showToast?.(t('toast.saved'), 'success')
      Router.refresh()
    } catch (error) {
      console.error('Error saving goal:', error)
      window.showToast?.(t('toast.error'), 'error')
    }
  })

  // Editar meta
  document.querySelectorAll('.btn-editar-meta').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation()
      const id = btn.dataset.id
      const metas = await dataManager.obtenerMetas()
      const meta = metas.find(m => m.id === id)
      if (!meta) return

      document.getElementById('meta-id').value = meta.id
      document.getElementById('meta-nombre').value = meta.nombre
      document.getElementById('meta-objetivo').value = meta.monto_objetivo
      document.getElementById('meta-actual').value = meta.monto_actual
      document.getElementById('meta-fecha').value = meta.fecha_limite || ''

      const iconRadio = document.querySelector(`input[name="meta-icono"][value="${meta.icono}"]`)
      if (iconRadio) iconRadio.checked = true
      const colorRadio = document.querySelector(`input[name="meta-color"][value="${meta.color}"]`)
      if (colorRadio) colorRadio.checked = true

      document.getElementById('modal-meta-titulo').textContent = t('goals.editGoal')
      modal?.classList.remove('hidden')
    })
  })

  // Eliminar meta
  document.querySelectorAll('.btn-eliminar-meta').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation()
      if (!confirm(t('goals.deleteConfirm'))) return
      try {
        await dataManager.eliminarMeta(btn.dataset.id)
        window.showToast?.(t('toast.deleted'), 'success')
        Router.refresh()
      } catch (error) {
        console.error('Error deleting goal:', error)
        window.showToast?.(t('toast.error'), 'error')
      }
    })
  })

  // Agregar fondos
  document.querySelectorAll('.btn-agregar-fondos').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      document.getElementById('fondos-meta-id').value = btn.dataset.id
      document.getElementById('fondos-monto').value = ''
      modalFondos?.classList.remove('hidden')
    })
  })

  cerrarFondos?.addEventListener('click', () => modalFondos?.classList.add('hidden'))
  modalFondos?.addEventListener('click', (e) => { if (e.target === modalFondos) modalFondos.classList.add('hidden') })

  formFondos?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const metaId = document.getElementById('fondos-meta-id').value
    const monto = parseFloat(document.getElementById('fondos-monto').value)
    if (!metaId || !monto || monto <= 0) return

    try {
      const metas = await dataManager.obtenerMetas()
      const meta = metas.find(m => m.id === metaId)
      if (meta) {
        await dataManager.actualizarMeta(metaId, {
          monto_actual: (meta.monto_actual || 0) + monto
        })
        window.showToast?.(t('toast.goalAdded'), 'success')
        Router.refresh()
      }
    } catch (error) {
      console.error('Error adding funds:', error)
      window.showToast?.(t('toast.error'), 'error')
    }
  })

  // Style radio buttons
  document.querySelectorAll('#meta-iconos input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', () => {
      document.querySelectorAll('#meta-iconos span').forEach(s => s.classList.remove('border-primary-500', 'bg-primary-50', 'dark:bg-primary-900/20'))
      radio.nextElementSibling?.classList.add('border-primary-500', 'bg-primary-50', 'dark:bg-primary-900/20')
    })
  })
  document.querySelectorAll('#meta-colores input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', () => {
      document.querySelectorAll('#meta-colores .color-option').forEach(s => s.classList.remove('selected'))
      radio.nextElementSibling?.classList.add('selected')
    })
  })
}
