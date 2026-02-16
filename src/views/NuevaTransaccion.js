/**
 * =====================================================
 * FINANZAPRO - Vista Nueva/Editar Transacción
 * =====================================================
 * Formulario para crear o editar transacciones
 * con soporte para adjuntar archivos
 */

import { dataManager } from '../services/dataManager.js'
import { db } from '../services/dexie.js'
import Router from '../router/index.js'
import { formatearFechaInput, formatearMoneda } from '../utils/helpers.js'

/**
 * Renderizar vista de Nueva Transacción
 * @param {object} params - Parámetros de la URL
 * @returns {Promise<string>} HTML de la vista
 */
export async function NuevaTransaccionView(params = {}) {
  const tipoInicial = params.tipo || 'gasto'
  const idEditar = params.id || null
  let transaccionEditar = null

  // Si es edición, obtener la transacción
  if (idEditar) {
    const transacciones = await db.transactions.where('id').equals(idEditar).toArray()
    transaccionEditar = transacciones[0]
  }

  const categorias = await dataManager.obtenerCategorias()
  const categoriasGasto = categorias.filter(c => c.tipo === 'gasto')
  const categoriasIngreso = categorias.filter(c => c.tipo === 'ingreso')

  const esEdicion = !!transaccionEditar
  const tipo = transaccionEditar?.tipo || tipoInicial

  return `
    <div class="max-w-2xl mx-auto space-y-6 pb-20 md:pb-0 animate-fade-in">
      
      <!-- Header -->
      <div class="flex items-center gap-4">
        <button onclick="history.back()" class="btn-icon">
          <svg class="w-6 h-6 text-dark-600 dark:text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-dark-900 dark:text-white">
            ${esEdicion ? 'Editar Transacción' : 'Nueva Transacción'}
          </h1>
          <p class="text-dark-500 dark:text-dark-400">
            ${esEdicion ? 'Modifica los datos de la transacción' : 'Registra un nuevo ingreso o gasto'}
          </p>
        </div>
      </div>
      
      <!-- Formulario -->
      <form id="form-transaccion" class="card space-y-6">
        
        <!-- Selector de tipo -->
        <div class="flex gap-3">
          <button type="button" id="btn-tipo-gasto" 
                  class="flex-1 py-4 px-6 rounded-xl border-2 transition-all ${tipo === 'gasto'
      ? 'border-danger-500 bg-danger-50 dark:bg-danger-900/20'
      : 'border-dark-200 dark:border-dark-700 hover:border-dark-300'}">
            <div class="flex flex-col items-center gap-2">
              <span class="w-12 h-12 bg-danger-100 dark:bg-danger-900/30 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-danger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                </svg>
              </span>
              <span class="font-semibold text-dark-900 dark:text-white">Gasto</span>
            </div>
          </button>
          
          <button type="button" id="btn-tipo-ingreso" 
                  class="flex-1 py-4 px-6 rounded-xl border-2 transition-all ${tipo === 'ingreso'
      ? 'border-success-500 bg-success-50 dark:bg-success-900/20'
      : 'border-dark-200 dark:border-dark-700 hover:border-dark-300'}">
            <div class="flex flex-col items-center gap-2">
              <span class="w-12 h-12 bg-success-100 dark:bg-success-900/30 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </span>
              <span class="font-semibold text-dark-900 dark:text-white">Ingreso</span>
            </div>
          </button>
        </div>
        
        <input type="hidden" id="tipo-transaccion" value="${tipo}">
        
        <!-- Monto -->
        <div>
          <label for="monto" class="label">Monto *</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500 dark:text-dark-400 text-lg font-medium">€</span>
            <input 
              type="number" 
              id="monto" 
              class="input pl-10 text-2xl font-bold"
              placeholder="0.00"
              step="0.01"
              min="0.01"
              value="${transaccionEditar?.monto || ''}"
              required
            >
          </div>
        </div>
        
        <!-- Categoría -->
        <div>
          <label for="categoria" class="label">Categoría *</label>
          <select id="categoria" class="input" required>
            <option value="">Selecciona una categoría</option>
            
            ${tipo === 'gasto' ? `
              ${categoriasGasto.map(cat => `
                <option value="${cat.id}" ${transaccionEditar?.category_id === cat.id ? 'selected' : ''}>
                  ${cat.icono} ${cat.nombre}
                </option>
              `).join('')}
            ` : `
              ${categoriasIngreso.map(cat => `
                <option value="${cat.id}" ${transaccionEditar?.category_id === cat.id ? 'selected' : ''}>
                  ${cat.icono} ${cat.nombre}
                </option>
              `).join('')}
            `}
          </select>
          <input type="hidden" id="categorias-gasto-data" value='${encodeURIComponent(JSON.stringify(categoriasGasto.map(c => ({ id: c.id, nombre: c.nombre, icono: c.icono }))))}'>
          <input type="hidden" id="categorias-ingreso-data" value='${encodeURIComponent(JSON.stringify(categoriasIngreso.map(c => ({ id: c.id, nombre: c.nombre, icono: c.icono }))))}'>
        </div>
        
        <!-- Fecha -->
        <div>
          <label for="fecha" class="label">Fecha *</label>
          <input 
            type="date" 
            id="fecha" 
            class="input"
            value="${transaccionEditar?.fecha || formatearFechaInput()}"
            required
          >
        </div>
        
        <!-- Descripción -->
        <div>
          <label for="descripcion" class="label">Descripción</label>
          <input 
            type="text" 
            id="descripcion" 
            class="input"
            placeholder="Ej: Compra en supermercado"
            value="${transaccionEditar?.descripcion || ''}"
          >
        </div>
        
        <!-- Notas -->
        <div>
          <label for="notas" class="label">Notas adicionales</label>
          <textarea 
            id="notas" 
            class="input resize-none"
            rows="3"
            placeholder="Añade cualquier nota o detalle..."
          >${transaccionEditar?.notas || ''}</textarea>
        </div>
        
        <!-- Archivo adjunto -->
        <div>
          <label class="label">Archivo adjunto (factura, recibo, etc.)</label>
          <div class="border-2 border-dashed border-dark-200 dark:border-dark-700 rounded-xl p-6 text-center hover:border-primary-500 transition-colors cursor-pointer" id="dropzone">
            <input type="file" id="archivo" class="hidden" accept="image/*,.pdf">
            
            <div id="preview-archivo" class="${transaccionEditar?.archivo_nombre ? '' : 'hidden'}">
              <div class="flex items-center justify-center gap-3 p-4 bg-dark-100 dark:bg-dark-800 rounded-lg">
                <svg class="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span id="nombre-archivo" class="font-medium text-dark-700 dark:text-dark-300">
                  ${transaccionEditar?.archivo_nombre || ''}
                </span>
                <button type="button" id="btn-quitar-archivo" class="ml-auto text-danger-500 hover:text-danger-600">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div id="placeholder-archivo" class="${transaccionEditar?.archivo_nombre ? 'hidden' : ''}">
              <svg class="w-12 h-12 mx-auto text-dark-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p class="text-dark-600 dark:text-dark-400 font-medium">
                Arrastra un archivo aquí o <span class="text-primary-600">haz clic para seleccionar</span>
              </p>
              <p class="text-sm text-dark-500 mt-1">PNG, JPG o PDF (máx. 5MB)</p>
            </div>
          </div>
        </div>
        
        <!-- Botones de acción -->
        <div class="flex gap-3 pt-4">
          ${esEdicion ? `
            <button type="button" id="btn-eliminar" class="btn-danger">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Eliminar
            </button>
          ` : ''}
          
          <button type="button" onclick="history.back()" class="btn-secondary flex-1">
            Cancelar
          </button>
          
          <button type="submit" class="btn-primary flex-1">
            <svg id="submit-spinner" class="hidden animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span id="submit-text">${esEdicion ? 'Guardar Cambios' : 'Guardar Transacción'}</span>
          </button>
        </div>
        
        <!-- ID oculto para edición -->
        ${esEdicion ? `<input type="hidden" id="transaccion-id" value="${idEditar}">` : ''}
      </form>
      
    </div>
  `
}

/**
 * Inicializar eventos del formulario
 */
export function initNuevaTransaccionEvents() {
  let archivoSeleccionado = null

  // Botones de tipo
  const btnGasto = document.getElementById('btn-tipo-gasto')
  const btnIngreso = document.getElementById('btn-tipo-ingreso')
  const inputTipo = document.getElementById('tipo-transaccion')
  const selectCategoria = document.getElementById('categoria')

  // Obtener datos de categorías desde hidden inputs
  const categoriasGastoData = document.getElementById('categorias-gasto-data')
  const categoriasIngresoData = document.getElementById('categorias-ingreso-data')

  let categoriasGasto = []
  let categoriasIngreso = []

  try {
    categoriasGasto = JSON.parse(decodeURIComponent(categoriasGastoData?.value || '%5B%5D'))
    categoriasIngreso = JSON.parse(decodeURIComponent(categoriasIngresoData?.value || '%5B%5D'))
  } catch (e) {
    console.warn('Error parsing categories:', e)
  }

  const cambiarTipo = (tipo) => {
    inputTipo.value = tipo

    if (tipo === 'gasto') {
      btnGasto.classList.add('border-danger-500', 'bg-danger-50', 'dark:bg-danger-900/20')
      btnGasto.classList.remove('border-dark-200', 'dark:border-dark-700')
      btnIngreso.classList.remove('border-success-500', 'bg-success-50', 'dark:bg-success-900/20')
      btnIngreso.classList.add('border-dark-200', 'dark:border-dark-700')
    } else {
      btnIngreso.classList.add('border-success-500', 'bg-success-50', 'dark:bg-success-900/20')
      btnIngreso.classList.remove('border-dark-200', 'dark:border-dark-700')
      btnGasto.classList.remove('border-danger-500', 'bg-danger-50', 'dark:bg-danger-900/20')
      btnGasto.classList.add('border-dark-200', 'dark:border-dark-700')
    }

    // Reconstruir opciones de categoría según el tipo
    if (selectCategoria) {
      const categorias = tipo === 'gasto' ? categoriasGasto : categoriasIngreso
      selectCategoria.innerHTML = '<option value="">Selecciona una categoría</option>' +
        categorias.map(cat => `<option value="${cat.id}">${cat.icono} ${cat.nombre}</option>`).join('')
    }
  }

  btnGasto?.addEventListener('click', () => cambiarTipo('gasto'))
  btnIngreso?.addEventListener('click', () => cambiarTipo('ingreso'))

  // Dropzone para archivos
  const dropzone = document.getElementById('dropzone')
  const inputArchivo = document.getElementById('archivo')
  const previewArchivo = document.getElementById('preview-archivo')
  const placeholderArchivo = document.getElementById('placeholder-archivo')
  const nombreArchivo = document.getElementById('nombre-archivo')
  const btnQuitar = document.getElementById('btn-quitar-archivo')

  const mostrarArchivo = (archivo) => {
    archivoSeleccionado = archivo
    nombreArchivo.textContent = archivo.name
    previewArchivo.classList.remove('hidden')
    placeholderArchivo.classList.add('hidden')
  }

  const quitarArchivo = () => {
    archivoSeleccionado = null
    inputArchivo.value = ''
    previewArchivo.classList.add('hidden')
    placeholderArchivo.classList.remove('hidden')
  }

  dropzone?.addEventListener('click', () => inputArchivo?.click())

  dropzone?.addEventListener('dragover', (e) => {
    e.preventDefault()
    dropzone.classList.add('border-primary-500')
  })

  dropzone?.addEventListener('dragleave', () => {
    dropzone.classList.remove('border-primary-500')
  })

  dropzone?.addEventListener('drop', (e) => {
    e.preventDefault()
    dropzone.classList.remove('border-primary-500')
    const archivo = e.dataTransfer.files[0]
    if (archivo) mostrarArchivo(archivo)
  })

  inputArchivo?.addEventListener('change', (e) => {
    const archivo = e.target.files[0]
    if (archivo) mostrarArchivo(archivo)
  })

  btnQuitar?.addEventListener('click', (e) => {
    e.stopPropagation()
    quitarArchivo()
  })

  // Envío del formulario
  const form = document.getElementById('form-transaccion')
  form?.addEventListener('submit', async (e) => {
    e.preventDefault()

    const spinner = document.getElementById('submit-spinner')
    const texto = document.getElementById('submit-text')
    const idEditar = document.getElementById('transaccion-id')?.value

    try {
      spinner.classList.remove('hidden')
      texto.textContent = 'Guardando...'

      const datos = {
        tipo: inputTipo.value,
        monto: parseFloat(document.getElementById('monto').value),
        category_id: document.getElementById('categoria').value || null,
        fecha: document.getElementById('fecha').value,
        descripcion: document.getElementById('descripcion').value.trim(),
        notas: document.getElementById('notas').value.trim()
      }

      if (idEditar) {
        // Actualizar transacción existente
        await dataManager.actualizarTransaccion(idEditar, datos)
      } else {
        // Crear nueva transacción
        await dataManager.crearTransaccion(datos, archivoSeleccionado)
      }

      // Navegar al listado
      Router.navigate('/transacciones')

    } catch (error) {
      console.error('Error guardando transacción:', error)
      alert('Error al guardar la transacción: ' + error.message)
    } finally {
      spinner.classList.add('hidden')
      texto.textContent = idEditar ? 'Guardar Cambios' : 'Guardar Transacción'
    }
  })

  // Botón eliminar
  document.getElementById('btn-eliminar')?.addEventListener('click', async () => {
    const idEditar = document.getElementById('transaccion-id')?.value

    if (confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
      try {
        await dataManager.eliminarTransaccion(idEditar)
        Router.navigate('/transacciones')
      } catch (error) {
        console.error('Error eliminando transacción:', error)
        alert('Error al eliminar la transacción')
      }
    }
  })
}


export default NuevaTransaccionView
