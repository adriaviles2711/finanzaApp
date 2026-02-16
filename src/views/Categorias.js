/**
 * =====================================================
 * FINANZAPRO - Vista Categorías
 * =====================================================
 * Gestión de categorías personalizadas
 */

import { dataManager } from '../services/dataManager.js'
import { COLORES_CATEGORIA, ICONOS_CATEGORIA } from '../utils/helpers.js'

/**
 * Renderizar vista de Categorías
 * @returns {Promise<string>} HTML de la vista
 */
export async function CategoriasView() {
  const categorias = await dataManager.obtenerCategorias()

  // Debug: Log categories to help identify data issues
  console.log('📂 Categorías obtenidas:', categorias)

  // Use case-insensitive filtering in case tipo is stored with different casing
  const categoriasGasto = categorias.filter(c => c.tipo?.toLowerCase() === 'gasto')
  const categoriasIngreso = categorias.filter(c => c.tipo?.toLowerCase() === 'ingreso')

  console.log(`  - Gastos: ${categoriasGasto.length}, Ingresos: ${categoriasIngreso.length}`)

  return `
    <div class="space-y-6 pb-20 md:pb-0 animate-fade-in">
      
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-dark-900 dark:text-white">Categorías</h1>
          <p class="text-dark-500 dark:text-dark-400">${categorias.length} categorías creadas</p>
        </div>
        
        <button id="btn-nueva-categoria" class="btn-primary">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nueva categoría
        </button>
      </div>
      
      <!-- Categorías de Gastos -->
      <div class="card">
        <div class="flex items-center gap-3 mb-4">
          <span class="w-10 h-10 bg-danger-100 dark:bg-danger-900/30 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-danger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
            </svg>
          </span>
          <div>
            <h3 class="font-semibold text-dark-900 dark:text-white">Categorías de Gastos</h3>
            <p class="text-sm text-dark-500 dark:text-dark-400">${categoriasGasto.length} categorías</p>
          </div>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          ${categoriasGasto.map(cat => `
            <div class="p-4 bg-dark-50 dark:bg-dark-800/50 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-700/50 transition-colors cursor-pointer grupo-categoria" data-id="${cat.id}">
              <div class="flex items-center gap-3">
                <span class="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style="background-color: ${cat.color}20;">
                  ${cat.icono}
                </span>
                <span class="font-medium text-dark-700 dark:text-dark-300 truncate">${cat.nombre}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <!-- Categorías de Ingresos -->
      <div class="card">
        <div class="flex items-center gap-3 mb-4">
          <span class="w-10 h-10 bg-success-100 dark:bg-success-900/30 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
            </svg>
          </span>
          <div>
            <h3 class="font-semibold text-dark-900 dark:text-white">Categorías de Ingresos</h3>
            <p class="text-sm text-dark-500 dark:text-dark-400">${categoriasIngreso.length} categorías</p>
          </div>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          ${categoriasIngreso.map(cat => `
            <div class="p-4 bg-dark-50 dark:bg-dark-800/50 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-700/50 transition-colors cursor-pointer grupo-categoria" data-id="${cat.id}">
              <div class="flex items-center gap-3">
                <span class="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style="background-color: ${cat.color}20;">
                  ${cat.icono}
                </span>
                <span class="font-medium text-dark-700 dark:text-dark-300 truncate">${cat.nombre}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <!-- Modal para nueva/editar categoría -->
      <div id="modal-categoria" class="modal-overlay hidden">
        <div class="modal-content p-6 max-w-lg">
          <div class="flex items-center justify-between mb-6">
            <h3 id="modal-titulo" class="text-xl font-bold text-dark-900 dark:text-white">Nueva Categoría</h3>
            <button id="btn-cerrar-modal" class="btn-icon">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form id="form-categoria" class="space-y-4">
            <input type="hidden" id="categoria-id" value="">
            
            <!-- Tipo -->
            <div>
              <label class="label">Tipo de categoría</label>
              <div class="flex gap-3">
                <label class="flex-1">
                  <input type="radio" name="tipo" value="gasto" class="hidden peer" checked>
                  <div class="p-4 border-2 border-dark-200 dark:border-dark-700 rounded-xl text-center cursor-pointer peer-checked:border-danger-500 peer-checked:bg-danger-50 dark:peer-checked:bg-danger-900/20 transition-all">
                    <span class="font-medium">💸 Gasto</span>
                  </div>
                </label>
                <label class="flex-1">
                  <input type="radio" name="tipo" value="ingreso" class="hidden peer">
                  <div class="p-4 border-2 border-dark-200 dark:border-dark-700 rounded-xl text-center cursor-pointer peer-checked:border-success-500 peer-checked:bg-success-50 dark:peer-checked:bg-success-900/20 transition-all">
                    <span class="font-medium">💰 Ingreso</span>
                  </div>
                </label>
              </div>
            </div>
            
            <!-- Nombre -->
            <div>
              <label for="categoria-nombre" class="label">Nombre *</label>
              <input type="text" id="categoria-nombre" class="input" placeholder="Ej: Restaurantes" required>
            </div>
            
            <!-- Icono -->
            <div>
              <label class="label">Icono</label>
              <div class="grid grid-cols-8 gap-2 p-3 bg-dark-50 dark:bg-dark-800 rounded-xl max-h-32 overflow-y-auto">
                ${ICONOS_CATEGORIA.map((icono, i) => `
                  <label class="cursor-pointer">
                    <input type="radio" name="icono" value="${icono}" class="hidden peer" ${i === 0 ? 'checked' : ''}>
                    <div class="w-10 h-10 flex items-center justify-center text-xl rounded-lg hover:bg-dark-200 dark:hover:bg-dark-700 peer-checked:bg-primary-100 dark:peer-checked:bg-primary-900/30 peer-checked:ring-2 ring-primary-500 transition-all">
                      ${icono}
                    </div>
                  </label>
                `).join('')}
              </div>
            </div>
            
            <!-- Color -->
            <div>
              <label class="label">Color</label>
              <div class="grid grid-cols-9 gap-2 p-3 bg-dark-50 dark:bg-dark-800 rounded-xl">
                ${COLORES_CATEGORIA.map((color, i) => `
                  <label class="cursor-pointer">
                    <input type="radio" name="color" value="${color}" class="hidden peer" ${i === 0 ? 'checked' : ''}>
                    <div class="w-8 h-8 rounded-full hover:scale-110 peer-checked:ring-2 ring-offset-2 ring-dark-900 dark:ring-white transition-all" style="background-color: ${color}"></div>
                  </label>
                `).join('')}
              </div>
            </div>
            
            <div class="flex gap-3 pt-4">
              <button type="button" id="btn-eliminar-categoria" class="btn-danger hidden">Eliminar</button>
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
export function initCategoriasEvents() {
  const modal = document.getElementById('modal-categoria')
  const btnAbrir = document.getElementById('btn-nueva-categoria')
  const btnCerrar = document.getElementById('btn-cerrar-modal')
  const btnCancelar = document.getElementById('btn-cancelar-modal')
  const btnEliminar = document.getElementById('btn-eliminar-categoria')
  const form = document.getElementById('form-categoria')
  const titulo = document.getElementById('modal-titulo')

  const abrirModal = (esEdicion = false) => {
    titulo.textContent = esEdicion ? 'Editar Categoría' : 'Nueva Categoría'
    btnEliminar.classList.toggle('hidden', !esEdicion)
    // Move modal to body for full-screen backdrop coverage
    if (modal && modal.parentElement !== document.body) {
      document.body.appendChild(modal)
    }
    modal?.classList.remove('hidden')
  }

  const cerrarModal = () => {
    modal?.classList.add('hidden')
    form?.reset()
    document.getElementById('categoria-id').value = ''
  }

  btnAbrir?.addEventListener('click', () => abrirModal(false))
  btnCerrar?.addEventListener('click', cerrarModal)
  btnCancelar?.addEventListener('click', cerrarModal)

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) cerrarModal()
  })

  // Editar categoría existente
  document.querySelectorAll('.grupo-categoria').forEach(el => {
    el.addEventListener('click', async () => {
      const id = el.dataset.id
      const categorias = await dataManager.obtenerCategorias()
      const cat = categorias.find(c => c.id === id)

      if (cat) {
        document.getElementById('categoria-id').value = cat.id
        document.getElementById('categoria-nombre').value = cat.nombre
        document.querySelector(`input[name="tipo"][value="${cat.tipo}"]`).checked = true
        document.querySelector(`input[name="icono"][value="${cat.icono}"]`).checked = true
        document.querySelector(`input[name="color"][value="${cat.color}"]`).checked = true
        abrirModal(true)
      }
    })
  })

  // Guardar categoría
  form?.addEventListener('submit', async (e) => {
    e.preventDefault()

    const id = document.getElementById('categoria-id').value
    const datos = {
      nombre: document.getElementById('categoria-nombre').value.trim(),
      tipo: document.querySelector('input[name="tipo"]:checked').value.toLowerCase(),
      icono: document.querySelector('input[name="icono"]:checked').value,
      color: document.querySelector('input[name="color"]:checked').value
    }

    try {
      if (id) {
        await dataManager.actualizarCategoria(id, datos)
      } else {
        await dataManager.crearCategoria(datos)
      }
      cerrarModal()
      window.location.reload()
    } catch (error) {
      console.error('Error guardando categoría:', error)
      alert('Error al guardar la categoría')
    }
  })

  // Eliminar categoría
  btnEliminar?.addEventListener('click', async () => {
    const id = document.getElementById('categoria-id').value

    if (confirm('¿Estás seguro de eliminar esta categoría? Las transacciones asociadas quedarán sin categoría.')) {
      try {
        await dataManager.eliminarCategoria(id)
        cerrarModal()
        window.location.reload()
      } catch (error) {
        console.error('Error eliminando categoría:', error)
        alert('Error al eliminar la categoría')
      }
    }
  })
}


export default CategoriasView
