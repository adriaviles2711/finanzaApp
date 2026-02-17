/**
 * =====================================================
 * FINANZAPRO - Vista Perfil Premium
 * =====================================================
 * Configuración completa del usuario y opciones de la cuenta
 * Con i18n completo y eliminación de cuenta
 */

import { authService, dbService } from '../services/supabase.js'
import { dataManager } from '../services/dataManager.js'
import { db } from '../services/dexie.js'
import { obtenerIniciales, descargarArchivo } from '../utils/helpers.js'
import { t } from '../utils/i18n.js'

/**
 * Renderizar vista de Perfil
 * @returns {Promise<string>} HTML de la vista
 */
export async function PerfilView() {
  const user = await authService.obtenerUsuario()
  let perfil = null

  try {
    const { data } = await dbService.obtenerPerfil()
    perfil = data
  } catch (e) {
    console.warn('No se pudo cargar el perfil desde Supabase')
  }

  const nombre = perfil?.nombre_completo || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario'
  const email = user?.email || 'Sin email'
  const iniciales = obtenerIniciales(nombre)
  const isDark = document.documentElement.classList.contains('dark')
  const monedaGuardada = localStorage.getItem('moneda') || 'EUR'
  const notificacionesEnabled = localStorage.getItem('notificaciones') !== 'false'
  const recordatoriosEnabled = localStorage.getItem('recordatorios') !== 'false'

  return `
    <div class="max-w-2xl mx-auto space-y-6 pb-24 md:pb-6 animate-fade-in">
      
      <!-- ===== TARJETA DE PERFIL ===== -->
      <div class="relative overflow-hidden card-gradient p-6">
        <!-- Decoración de fondo -->
        <div class="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary-400/15 to-primary-600/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div class="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-primary-500/10 to-transparent rounded-full -ml-12 -mb-12 blur-xl"></div>
        
        <div class="relative flex items-center gap-4 mb-6">
          <div class="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-primary-500/25 ring-4 ring-primary-500/10">
            ${iniciales}
          </div>
          <div class="flex-1 min-w-0">
            <h2 class="text-xl font-bold text-dark-900 dark:text-white truncate">${nombre}</h2>
            <p class="text-dark-500 dark:text-dark-400 truncate text-sm">${email}</p>
            <span class="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400 rounded-full text-xs font-semibold tracking-wide">
              <span class="w-1.5 h-1.5 bg-success-500 rounded-full animate-pulse"></span>
              ${t('profile.accountActive')}
            </span>
          </div>
        </div>
        
        <button id="btn-editar-perfil" class="relative w-full py-3.5 px-6 rounded-2xl font-semibold text-dark-700 dark:text-dark-200 bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm border border-dark-200/60 dark:border-dark-700/60 hover:bg-white dark:hover:bg-dark-800 hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2 group">
          <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          ${t('profile.editProfile')}
        </button>
      </div>
      
      <!-- ===== APARIENCIA ===== -->
      <div class="card">
        <div class="flex items-center gap-3 mb-5">
          <div class="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <h3 class="font-bold text-lg text-dark-900 dark:text-white">${t('profile.appearance')}</h3>
        </div>
        
        <div class="space-y-3">
          <!-- Tema oscuro/claro -->
          <div class="flex items-center justify-between p-4 bg-dark-50/80 dark:bg-dark-800/50 rounded-2xl hover:bg-dark-100/80 dark:hover:bg-dark-700/50 transition-colors duration-200">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/20">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </div>
              <div>
                <p class="font-semibold text-dark-900 dark:text-white">${t('profile.darkMode')}</p>
                <p class="text-sm text-dark-500 dark:text-dark-400">${t('profile.darkModeDesc')}</p>
              </div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" id="toggle-tema-perfil" class="sr-only peer" ${isDark ? 'checked' : ''}>
              <div class="w-14 h-8 bg-dark-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/20 rounded-full peer dark:bg-dark-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-dark-200 after:border after:rounded-full after:h-6 after:w-6 after:transition-all after:shadow-md dark:border-dark-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>

      <!-- ===== PREFERENCIAS ===== -->
      <div class="card">
        <div class="flex items-center gap-3 mb-5">
          <div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 class="font-bold text-lg text-dark-900 dark:text-white">${t('profile.preferences')}</h3>
        </div>
        
        <div class="space-y-3">
          <!-- Moneda -->
          <div class="flex items-center justify-between p-4 bg-dark-50/80 dark:bg-dark-800/50 rounded-2xl hover:bg-dark-100/80 dark:hover:bg-dark-700/50 transition-colors duration-200">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md shadow-yellow-500/20">
                <span class="text-xl text-white font-bold">€</span>
              </div>
              <div>
                <p class="font-semibold text-dark-900 dark:text-white">${t('profile.currency')}</p>
                <p class="text-sm text-dark-500 dark:text-dark-400">${t('profile.currencyDesc')}</p>
              </div>
            </div>
            <select id="select-moneda" class="min-w-[120px] py-3 px-4 bg-white dark:bg-dark-700 border border-dark-200 dark:border-dark-600 rounded-xl text-dark-900 dark:text-white font-medium text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer appearance-none">
              <option value="EUR" ${monedaGuardada === 'EUR' ? 'selected' : ''}>EUR - Euro €</option>
              <option value="USD" ${monedaGuardada === 'USD' ? 'selected' : ''}>USD - Dólar $</option>
              <option value="GBP" ${monedaGuardada === 'GBP' ? 'selected' : ''}>GBP - Libra £</option>
              <option value="MXN" ${monedaGuardada === 'MXN' ? 'selected' : ''}>MXN - Peso</option>
            </select>
          </div>
          
          <!-- Notificaciones -->
          <div class="flex items-center justify-between p-4 bg-dark-50/80 dark:bg-dark-800/50 rounded-2xl hover:bg-dark-100/80 dark:hover:bg-dark-700/50 transition-colors duration-200">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md shadow-rose-500/20">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <p class="font-semibold text-dark-900 dark:text-white">${t('profile.notifications')}</p>
                <p class="text-sm text-dark-500 dark:text-dark-400">${t('profile.notifDesc')}</p>
              </div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" id="toggle-notificaciones" class="sr-only peer" ${notificacionesEnabled ? 'checked' : ''}>
              <div class="w-14 h-8 bg-dark-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/20 rounded-full peer dark:bg-dark-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-dark-200 after:border after:rounded-full after:h-6 after:w-6 after:transition-all after:shadow-md dark:border-dark-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>
          
          <!-- Recordatorios de presupuesto -->
          <div class="flex items-center justify-between p-4 bg-dark-50/80 dark:bg-dark-800/50 rounded-2xl hover:bg-dark-100/80 dark:hover:bg-dark-700/50 transition-colors duration-200">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="font-semibold text-dark-900 dark:text-white">${t('profile.reminders')}</p>
                <p class="text-sm text-dark-500 dark:text-dark-400">${t('profile.remindersDesc')}</p>
              </div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" id="toggle-recordatorios" class="sr-only peer" ${recordatoriosEnabled ? 'checked' : ''}>
              <div class="w-14 h-8 bg-dark-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/20 rounded-full peer dark:bg-dark-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-dark-200 after:border after:rounded-full after:h-6 after:w-6 after:transition-all after:shadow-md dark:border-dark-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>
      
      <!-- ===== DATOS Y SINCRONIZACIÓN ===== -->
      <div class="card">
        <div class="flex items-center gap-3 mb-5">
          <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
          </div>
          <h3 class="font-bold text-lg text-dark-900 dark:text-white">${t('profile.dataManagement')}</h3>
        </div>
        
        <div class="space-y-3">
          <!-- Exportar datos -->
          <button id="btn-exportar" class="flex items-center justify-between w-full p-4 bg-dark-50/80 dark:bg-dark-800/50 rounded-2xl hover:bg-dark-100/80 dark:hover:bg-dark-700/50 transition-all duration-200 group">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-md shadow-emerald-500/20">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <div class="text-left">
                <p class="font-semibold text-dark-900 dark:text-white">${t('profile.exportData')}</p>
                <p class="text-sm text-dark-500 dark:text-dark-400">${t('profile.exportDesc')}</p>
              </div>
            </div>
            <svg class="w-5 h-5 text-dark-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <!-- Importar datos -->
          <button id="btn-importar" class="flex items-center justify-between w-full p-4 bg-dark-50/80 dark:bg-dark-800/50 rounded-2xl hover:bg-dark-100/80 dark:hover:bg-dark-700/50 transition-all duration-200 group">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-md shadow-indigo-500/20">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <div class="text-left">
                <p class="font-semibold text-dark-900 dark:text-white">${t('profile.importData') || 'Importar datos'}</p>
                <p class="text-sm text-dark-500 dark:text-dark-400">${t('profile.importDesc') || 'Restaurar copia de seguridad (JSON)'}</p>
              </div>
            </div>
            <svg class="w-5 h-5 text-dark-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
            <input type="file" id="file-import-json" accept=".json" class="hidden" />
          </button>
          
          <!-- Sincronizar -->
          <button id="btn-sincronizar" class="flex items-center justify-between w-full p-4 bg-dark-50/80 dark:bg-dark-800/50 rounded-2xl hover:bg-dark-100/80 dark:hover:bg-dark-700/50 transition-all duration-200 group">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-md shadow-sky-500/20">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div class="text-left">
                <p class="font-semibold text-dark-900 dark:text-white">${t('profile.syncNow')}</p>
                <p class="text-sm text-dark-500 dark:text-dark-400">${t('profile.syncDesc')}</p>
              </div>
            </div>
            <svg class="w-5 h-5 text-dark-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          <!-- Limpiar caché -->
          <button id="btn-limpiar-cache" class="flex items-center justify-between w-full p-4 bg-dark-50/80 dark:bg-dark-800/50 rounded-2xl hover:bg-dark-100/80 dark:hover:bg-dark-700/50 transition-all duration-200 group">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-md shadow-amber-500/20">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div class="text-left">
                <p class="font-semibold text-dark-900 dark:text-white">${t('profile.clearCache')}</p>
                <p class="text-sm text-dark-500 dark:text-dark-400">${t('profile.clearCacheDesc')}</p>
              </div>
            </div>
            <svg class="w-5 h-5 text-dark-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      
      <!-- ===== ACERCA DE ===== -->
      <div class="card">
        <div class="flex items-center gap-3 mb-5">
          <div class="w-10 h-10 bg-gradient-to-br from-gray-500 to-slate-600 rounded-xl flex items-center justify-center shadow-lg shadow-gray-500/15">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="font-bold text-lg text-dark-900 dark:text-white">${t('profile.about')}</h3>
        </div>
        
        <div class="space-y-3">
          <div class="flex items-center justify-between p-4 bg-dark-50/80 dark:bg-dark-800/50 rounded-2xl">
            <span class="text-dark-600 dark:text-dark-400">${t('profile.version')}</span>
            <span class="font-semibold text-dark-900 dark:text-white px-3 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg text-sm">1.0.0</span>
          </div>
          <div class="flex items-center justify-between p-4 bg-dark-50/80 dark:bg-dark-800/50 rounded-2xl">
            <span class="text-dark-600 dark:text-dark-400">${t('profile.developer')}</span>
            <span class="font-semibold text-dark-900 dark:text-white">Adrian Aviles</span>
          </div>
        </div>
      </div>
      
      <!-- ===== SESIÓN Y CUENTA ===== -->
      <div class="space-y-3">
        <!-- Cerrar sesión -->
        <button id="btn-cerrar-sesion" class="w-full py-4 px-6 rounded-2xl font-semibold text-white bg-gradient-to-r from-danger-500 to-danger-600 hover:from-danger-600 hover:to-danger-700 shadow-lg shadow-danger-500/25 hover:shadow-xl hover:shadow-danger-500/30 transition-all duration-300 flex items-center justify-center gap-3 group">
          <svg class="w-5 h-5 group-hover:translate-x-[-2px] transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          ${t('profile.logout')}
        </button>
        
        <!-- Eliminar cuenta -->
        <button id="btn-eliminar-cuenta" class="w-full py-3.5 px-6 rounded-2xl font-medium text-danger-500 dark:text-danger-400 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800/50 hover:bg-danger-100 dark:hover:bg-danger-900/30 hover:border-danger-300 dark:hover:border-danger-700 transition-all duration-300 flex items-center justify-center gap-2 text-sm group">
          <svg class="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          ${t('profile.deleteAccount')}
        </button>
      </div>
      
      <!-- Footer -->
      <div class="text-center py-4">
        <p class="text-sm text-dark-400 dark:text-dark-500">FinanzaPro © 2026</p>
        <p class="text-xs text-dark-300 dark:text-dark-600 mt-1">${t('profile.madeWith')}</p>
      </div>
      
    </div>
  `
}

/**
 * Inicializar eventos del perfil
 */
export function initPerfilEvents() {
  // Toggle tema - sincronizado con el header
  const toggleTema = document.getElementById('toggle-tema-perfil')
  if (toggleTema) {
    toggleTema.addEventListener('change', (e) => {
      document.documentElement.classList.toggle('dark', e.target.checked)
      localStorage.setItem('theme', e.target.checked ? 'dark' : 'light')
      updateHeaderThemeIcon()
    })
  }

  // Cambio de moneda
  document.getElementById('select-moneda')?.addEventListener('change', (e) => {
    localStorage.setItem('moneda', e.target.value)
    window.showToast?.(t('profile.currencyUpdated'), 'success')
  })

  // Toggle notificaciones
  document.getElementById('toggle-notificaciones')?.addEventListener('change', (e) => {
    localStorage.setItem('notificaciones', e.target.checked ? 'true' : 'false')
    window.showToast?.(e.target.checked ? t('profile.notifOn') : t('profile.notifOff'), 'success')
  })

  // Toggle recordatorios
  document.getElementById('toggle-recordatorios')?.addEventListener('change', (e) => {
    localStorage.setItem('recordatorios', e.target.checked ? 'true' : 'false')
    window.showToast?.(e.target.checked ? t('profile.remindersOn') : t('profile.remindersOff'), 'success')
  })

  // Exportar datos
  document.getElementById('btn-exportar')?.addEventListener('click', async () => {
    try {
      const transacciones = await dataManager.obtenerTransacciones()
      const categorias = await dataManager.obtenerCategorias()

      const datos = {
        exportado: new Date().toISOString(),
        transacciones,
        categorias
      }

      descargarArchivo(datos, `finanzapro-export-${new Date().toISOString().split('T')[0]}.json`)
      window.showToast?.(t('profile.exportSuccess'), 'success')
    } catch (error) {
      console.error('Error exportando:', error)
      window.showToast?.(t('profile.exportError'), 'error')
    }
  })

  // Importar datos
  document.getElementById('btn-importar')?.addEventListener('click', () => {
    document.getElementById('file-import-json')?.click()
  })

  document.getElementById('file-import-json')?.addEventListener('change', async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (confirm('¿Seguro que quieres restaurar los datos? Se fusionarán con los actuales.')) {
      const reader = new FileReader()
      reader.onload = async (event) => {
        try {
          const jsonData = JSON.parse(event.target.result)
          window.showToast?.('Importando datos...', 'info')

          const resumen = await dataManager.importarDatosJson(jsonData)

          window.showToast?.(`Importación completada: ${resumen.transacciones} transacciones, ${resumen.categorias} categorías.`, 'success')

          // Reload after short delay
          setTimeout(() => window.location.reload(), 2000)
        } catch (error) {
          console.error('Error importando:', error)
          window.showToast?.('Error al importar archivo', 'error')
        }
      }
      reader.readAsText(file)
    }
    // Reset input
    e.target.value = ''
  })

  // Sincronizar
  document.getElementById('btn-sincronizar')?.addEventListener('click', async () => {
    try {
      const btn = document.getElementById('btn-sincronizar')
      const icon = btn?.querySelector('.group-hover\\:scale-105')
      if (icon) icon.classList.add('animate-spin')

      await dataManager.sincronizar()

      if (icon) icon.classList.remove('animate-spin')
      window.showToast?.(t('profile.syncSuccess'), 'success')
    } catch (error) {
      console.error('Error sincronizando:', error)
      window.showToast?.(t('profile.syncError'), 'error')
    }
  })

  // Limpiar caché
  document.getElementById('btn-limpiar-cache')?.addEventListener('click', async () => {
    if (confirm(t('profile.clearCacheConfirm'))) {
      try {
        await db.delete()
        await db.open()
        localStorage.removeItem('finanzapro_cache')
        window.showToast?.(t('profile.cacheSuccess'), 'success')
        setTimeout(() => window.location.reload(), 1500)
      } catch (error) {
        console.error('Error limpiando caché:', error)
        window.showToast?.(t('profile.cacheError'), 'error')
      }
    }
  })

  // Editar perfil
  document.getElementById('btn-editar-perfil')?.addEventListener('click', () => {
    showEditProfileModal()
  })

  // Cerrar sesión con modal premium
  document.getElementById('btn-cerrar-sesion')?.addEventListener('click', () => {
    showLogoutModal()
  })

  // Eliminar cuenta
  document.getElementById('btn-eliminar-cuenta')?.addEventListener('click', () => {
    showDeleteAccountModal()
  })
}

/**
 * Actualizar icono del tema en el header
 */
function updateHeaderThemeIcon() {
  const btnTheme = document.getElementById('btn-toggle-theme')
  if (btnTheme) {
    const isDark = document.documentElement.classList.contains('dark')
    btnTheme.innerHTML = isDark
      ? `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>`
      : `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>`
  }
}

/**
 * Modal de cierre de sesión
 */
function showLogoutModal() {
  const modal = document.createElement('div')
  modal.id = 'logout-modal-perfil'
  modal.innerHTML = `
    <div class="fixed inset-0 bg-dark-900/60 dark:bg-dark-950/80 backdrop-blur-sm z-50 animate-fade-in" id="logout-backdrop-perfil"></div>
    <div class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-white dark:bg-dark-900 rounded-3xl p-8 shadow-2xl border border-dark-100 dark:border-dark-800 z-50 animate-scale-in">
      <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-danger-100 to-danger-50 dark:from-danger-900/40 dark:to-danger-900/20 rounded-3xl flex items-center justify-center">
        <svg class="w-10 h-10 text-danger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </div>
      <h3 class="text-xl font-bold text-dark-900 dark:text-white text-center mb-2">${t('profile.logoutConfirm')}</h3>
      <p class="text-dark-500 dark:text-dark-400 text-center mb-8">${t('profile.logoutDesc')}</p>
      <div class="flex gap-3">
        <button id="logout-cancel-perfil" class="flex-1 py-3.5 px-6 rounded-2xl font-semibold text-dark-600 dark:text-dark-300 bg-dark-100 dark:bg-dark-800 hover:bg-dark-200 dark:hover:bg-dark-700 transition-all">${t('common.cancel')}</button>
        <button id="logout-confirm-perfil" class="flex-1 py-3.5 px-6 rounded-2xl font-semibold text-white bg-gradient-to-r from-danger-500 to-danger-600 hover:from-danger-600 hover:to-danger-700 shadow-lg shadow-danger-500/25 transition-all">${t('profile.logout')}</button>
      </div>
    </div>
  `

  document.body.appendChild(modal)

  const closeModal = () => modal.remove()

  document.getElementById('logout-backdrop-perfil').onclick = closeModal
  document.getElementById('logout-cancel-perfil').onclick = closeModal
  document.getElementById('logout-confirm-perfil').onclick = async () => {
    closeModal()
    await authService.logout()
  }
}

/**
 * Modal de eliminación de cuenta (con confirmación de escritura)
 */
function showDeleteAccountModal() {
  const modal = document.createElement('div')
  modal.id = 'delete-account-modal'
  const keyword = t('profile.deleteAccountKeyword')

  modal.innerHTML = `
    <div class="fixed inset-0 bg-dark-900/70 dark:bg-dark-950/85 backdrop-blur-md z-[100] animate-fade-in" id="delete-account-backdrop"></div>
    <div class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-md bg-white dark:bg-dark-900 rounded-3xl p-8 shadow-2xl border border-danger-200/60 dark:border-danger-800/40 z-[100] animate-scale-in">
      <!-- Danger Icon -->
      <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-danger-100 to-danger-50 dark:from-danger-900/40 dark:to-danger-900/20 rounded-3xl flex items-center justify-center ring-4 ring-danger-500/10">
        <svg class="w-10 h-10 text-danger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      
      <h3 class="text-xl font-bold text-dark-900 dark:text-white text-center mb-2">${t('profile.deleteAccountConfirm')}</h3>
      <p class="text-dark-500 dark:text-dark-400 text-center mb-6 text-sm leading-relaxed">${t('profile.deleteAccountWarning')}</p>
      
      <!-- Typing confirmation -->
      <div class="mb-6">
        <label class="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">${t('profile.deleteAccountTyping')}</label>
        <input type="text" id="delete-confirm-input" class="w-full px-4 py-3 bg-danger-50/50 dark:bg-danger-900/10 border-2 border-danger-200 dark:border-danger-800/50 rounded-xl text-dark-900 dark:text-white font-mono text-center text-lg tracking-widest focus:ring-2 focus:ring-danger-500 focus:border-transparent placeholder:text-danger-300 dark:placeholder:text-danger-700" placeholder="${t('profile.deleteAccountPlaceholder')}" autocomplete="off" spellcheck="false">
      </div>
      
      <div class="flex gap-3">
        <button id="delete-account-cancel" class="flex-1 py-3.5 px-6 rounded-2xl font-semibold text-dark-600 dark:text-dark-300 bg-dark-100 dark:bg-dark-800 hover:bg-dark-200 dark:hover:bg-dark-700 transition-all">${t('common.cancel')}</button>
        <button id="delete-account-confirm" disabled class="flex-1 py-3.5 px-6 rounded-2xl font-semibold text-white bg-dark-300 dark:bg-dark-700 cursor-not-allowed transition-all duration-300">${t('profile.deleteAccount')}</button>
      </div>
    </div>
  `

  document.body.appendChild(modal)

  const closeModal = () => modal.remove()
  const input = document.getElementById('delete-confirm-input')
  const confirmBtn = document.getElementById('delete-account-confirm')

  // Enable/disable confirm button based on input
  input?.addEventListener('input', () => {
    const matches = input.value.trim().toUpperCase() === keyword.toUpperCase()
    if (matches) {
      confirmBtn.disabled = false
      confirmBtn.className = 'flex-1 py-3.5 px-6 rounded-2xl font-semibold text-white bg-gradient-to-r from-danger-500 to-danger-600 hover:from-danger-600 hover:to-danger-700 shadow-lg shadow-danger-500/25 transition-all duration-300 cursor-pointer'
    } else {
      confirmBtn.disabled = true
      confirmBtn.className = 'flex-1 py-3.5 px-6 rounded-2xl font-semibold text-white bg-dark-300 dark:bg-dark-700 cursor-not-allowed transition-all duration-300'
    }
  })

  document.getElementById('delete-account-backdrop').onclick = closeModal
  document.getElementById('delete-account-cancel').onclick = closeModal

  confirmBtn.onclick = async () => {
    if (confirmBtn.disabled) return

    // Show loading state
    confirmBtn.innerHTML = `
      <svg class="animate-spin h-5 w-5 mr-2 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      ${t('profile.deleting')}
    `
    confirmBtn.disabled = true

    try {
      // 1. Delete local IndexedDB data
      await db.delete()

      // 2. Clear localStorage
      localStorage.clear()

      // 3. Delete remote data and sign out
      const { error } = await authService.eliminarCuenta()

      if (error) {
        console.error('Error eliminando cuenta remota:', error)
      }

      closeModal()
      // Reload after delete — will redirect to login
      window.location.reload()
    } catch (error) {
      console.error('Error eliminando cuenta:', error)
      window.showToast?.(t('toast.error'), 'error')
      closeModal()
    }
  }
}

/**
 * Modal para editar perfil
 */
function showEditProfileModal() {
  const modal = document.createElement('div')
  modal.id = 'edit-profile-modal'
  modal.innerHTML = `
    <div class="fixed inset-0 bg-dark-900/60 dark:bg-dark-950/80 backdrop-blur-sm z-[100] animate-fade-in" id="edit-profile-backdrop"></div>
    <div class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white dark:bg-dark-900 rounded-3xl p-6 shadow-2xl border border-dark-100 dark:border-dark-800 z-[100] animate-scale-in">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-bold text-dark-900 dark:text-white">${t('profile.editProfile')}</h3>
        <button id="edit-profile-close" class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors">
          <svg class="w-5 h-5 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <form id="edit-profile-form" class="space-y-4">
        <div>
          <label for="edit-nombre" class="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">${t('profile.editName')}</label>
          <input type="text" id="edit-nombre" class="w-full px-4 py-3 bg-dark-50 dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="${t('profile.editNamePlaceholder')}">
        </div>
        <div class="flex gap-3 pt-4">
          <button type="button" id="edit-profile-cancel" class="flex-1 py-3.5 px-6 rounded-2xl font-semibold text-dark-600 dark:text-dark-300 bg-dark-100 dark:bg-dark-800 hover:bg-dark-200 dark:hover:bg-dark-700 transition-all">${t('common.cancel')}</button>
          <button type="submit" class="flex-1 py-3.5 px-6 rounded-2xl font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/25 transition-all">${t('common.save')}</button>
        </div>
      </form>
    </div>
  `

  document.body.appendChild(modal)

  const closeModal = () => modal.remove()

  document.getElementById('edit-profile-backdrop').onclick = closeModal
  document.getElementById('edit-profile-close').onclick = closeModal
  document.getElementById('edit-profile-cancel').onclick = closeModal

  document.getElementById('edit-profile-form').onsubmit = async (e) => {
    e.preventDefault()
    const nombre = document.getElementById('edit-nombre').value.trim()
    if (nombre) {
      try {
        await dbService.actualizarPerfil({ nombre_completo: nombre })
        window.showToast?.(t('profile.profileUpdated'), 'success')
        closeModal()
        setTimeout(() => window.location.reload(), 500)
      } catch (error) {
        console.error('Error actualizando perfil:', error)
        window.showToast?.(t('profile.profileError'), 'error')
      }
    }
  }
}

export default PerfilView
