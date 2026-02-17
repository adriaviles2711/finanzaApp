/**
 * =====================================================
 * FINANZAPRO - Layout Principal
 * =====================================================
 * Componente del layout con:
 * - Sidebar (visible en desktop)
 * - Bottom Navigation (visible en móvil)
 * - Header con perfil y notificaciones
 * - i18n language selector
 */

import { authService } from '../services/supabase.js'
import { t, getCurrentLang, setLang, getSupportedLangs } from '../utils/i18n.js'

// Flag para evitar inicialización múltiple de eventos
let layoutEventsInitialized = false

/**
 * Renderizar el layout principal
 * @returns {string} HTML del layout
 */
export function renderLayout() {
  // Resetear flag cuando se renderiza nuevo layout
  layoutEventsInitialized = false

  // Inicializar eventos después de un pequeño delay
  setTimeout(initLayoutEvents, 100)

  const currentLang = getCurrentLang()
  const langs = getSupportedLangs()

  return `
    <!-- Layout Principal -->
    <div class="h-full flex flex-col md:flex-row overflow-hidden">
      
      <!-- ========== SIDEBAR (Desktop) ========== -->
      <aside class="sidebar">
        <!-- Logo -->
        <div class="p-5 border-b border-dark-100 dark:border-dark-800">
          <a href="#/dashboard" class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 class="font-bold text-dark-900 dark:text-white">FinanzaPro</h1>
              <p class="text-xs text-dark-500 dark:text-dark-400">${t('login.subtitle')}</p>
            </div>
          </a>
        </div>
        
        <!-- Navegación Principal -->
        <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
          <a href="#/dashboard" class="nav-item" data-nav="dashboard">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            <span>${t('nav.dashboard')}</span>
          </a>
          
          <a href="#/transacciones" class="nav-item" data-nav="transacciones">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <span>${t('nav.transactions')}</span>
          </a>
          
          <a href="#/presupuestos" class="nav-item" data-nav="presupuestos">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>${t('nav.budgets')}</span>
          </a>
          
          <a href="#/categorias" class="nav-item" data-nav="categorias">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span>${t('nav.categories')}</span>
          </a>

          <a href="#/metas" class="nav-item" data-nav="metas">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>${t('nav.goals')}</span>
          </a>
          
          <a href="#/informes" class="nav-item" data-nav="informes">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>${t('nav.reports')}</span>
          </a>
          
          <!-- Separador -->
          <div class="my-4 border-t border-dark-100 dark:border-dark-800"></div>
          
          <a href="#/perfil" class="nav-item" data-nav="perfil">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>${t('nav.profile')}</span>
          </a>

          <!-- Language Selector (sidebar) -->
          <div class="my-4 border-t border-dark-100 dark:border-dark-800"></div>
          <div class="flex gap-1">
            ${langs.map(l => `
              <button class="lang-btn flex-1 py-2 px-1 text-xs rounded-xl font-medium transition-all duration-200 ${l.code === currentLang ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 ring-1 ring-primary-200 dark:ring-primary-800' : 'text-dark-500 hover:bg-dark-100 dark:hover:bg-dark-800'}" data-lang="${l.code}" title="${l.name}">
                <span>${l.flag}</span> ${l.code.toUpperCase()}
              </button>
            `).join('')}
          </div>
        </nav>
        
        <!-- Botón de Cerrar Sesión -->
        <div class="p-4 border-t border-dark-100 dark:border-dark-800">
          <button id="btn-logout-sidebar" class="nav-item w-full text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>${t('nav.logout')}</span>
          </button>
        </div>
      </aside>
      
      <!-- ========== CONTENIDO PRINCIPAL ========== -->
      <main class="flex-1 flex flex-col overflow-hidden bg-dark-50 dark:bg-dark-950">
        
        <!-- Header superior (móvil y desktop) -->
      <header class="sticky top-0 z-40 flex items-center justify-between px-4 md:px-6 py-4 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md border-b border-dark-100 dark:border-dark-800 safe-top transition-all duration-300">
          <!-- Logo móvil -->
          <div class="flex items-center gap-3 md:hidden">
            <div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-md shadow-primary-500/20">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span class="font-bold text-dark-900 dark:text-white tracking-tight">FinanzaPro</span>
          </div>
          
          <!-- Título de página (desktop) -->
          <div class="hidden md:block">
            <h2 id="page-title" class="text-xl font-semibold text-dark-900 dark:text-white">${t('nav.dashboard')}</h2>
          </div>
          
          <!-- Acciones del header -->
          <div class="flex items-center gap-3">
            <!-- Language selector (mobile compact) -->
            <div class="flex md:hidden gap-1 bg-dark-100 dark:bg-dark-800 rounded-xl p-1 relative z-50">
              ${langs.map(l => `
                <button class="lang-btn px-2.5 py-1.5 text-sm rounded-lg transition-all active:scale-95 ${l.code === currentLang ? 'bg-white dark:bg-dark-700 shadow-sm font-bold ring-1 ring-black/5 dark:ring-white/10' : 'text-dark-500 hover:text-dark-700 dark:hover:text-dark-300'}" data-lang="${l.code}">
                  <div class="w-5 h-3.5 flex items-center justify-center overflow-hidden rounded-[2px] shadow-sm transform transition-transform group-hover:scale-110">
                    ${l.flag}
                  </div>
                </button>
              `).join('')}
            </div>

            <!-- Botón de tema oscuro/claro -->
            <button id="btn-toggle-theme" class="btn-icon text-dark-500 dark:text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-xl transition-colors" title="Toggle theme">
              <svg class="w-5 h-5 dark:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <svg class="w-5 h-5 hidden dark:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </button>
            
            <!-- Indicador de conexión -->
            <div id="connection-status" class="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400">
              <span class="w-2 h-2 bg-success-500 rounded-full animate-pulse"></span>
              <span>${t('common.online')}</span>
            </div>
            
            <!-- Botón de añadir (acceso rápido) -->
            <a href="#/nueva-transaccion" class="btn-primary py-2 px-3 md:px-4 hidden md:flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>${t('nav.newTransaction')}</span>
            </a>
          </div>
        </header>
        
        <!-- Contenido de la vista actual -->
        <div id="main-content" class="page-container relative z-0">
          <!-- El contenido será inyectado por el Router -->
        </div>
      </main>
      
      <!-- ========== BOTTOM NAVIGATION (Móvil) ========== -->
      <nav class="bottom-nav backdrop-blur-xl bg-white/95 dark:bg-dark-900/95 border-t border-dark-200/60 dark:border-dark-700/60 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50">
        <!-- Floating Action Button -->
        <a href="#/nueva-transaccion" class="absolute left-1/2 -translate-x-1/2 -top-6 md:hidden z-50 group">
          <div class="w-14 h-14 bg-gradient-to-br from-primary-500 via-primary-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-primary-500/40 border-[3px] border-white dark:border-dark-900 transition-transform active:scale-95 group-hover:scale-105 group-hover:shadow-primary-500/60">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
            </svg>
          </div>
        </a>
        
        <div class="flex items-center justify-between w-full h-full px-2 max-w-md mx-auto relative">
          
          <!-- Grupo Izquierdo -->
          <div class="flex items-center justify-between flex-1 gap-1 pr-6">
            <!-- Dashboard -->
            <a href="#/dashboard" class="bottom-nav-item flex-1 min-w-0" data-nav="dashboard">
              <div class="nav-icon-container p-1 rounded-xl transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <span class="text-[10px] font-medium truncate w-full text-center leading-tight transition-opacity">${t('nav.dashboardShort')}</span>
            </a>
            
            <!-- Transacciones -->
            <a href="#/transacciones" class="bottom-nav-item flex-1 min-w-0" data-nav="transacciones">
              <div class="nav-icon-container p-1 rounded-xl transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span class="text-[10px] font-medium truncate w-full text-center leading-tight transition-opacity">${t('nav.transactionsShort')}</span>
            </a>
            
            <!-- Presupuestos -->
            <a href="#/presupuestos" class="bottom-nav-item flex-1 min-w-0" data-nav="presupuestos">
              <div class="nav-icon-container p-1 rounded-xl transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span class="text-[10px] font-medium truncate w-full text-center leading-tight transition-opacity">${t('nav.budgetsShort')}</span>
            </a>
          </div>

          <!-- Espaciador Central (para FAB) -->
          <div class="w-12 shrink-0"></div>

          <!-- Grupo Derecho -->
          <div class="flex items-center justify-between flex-1 gap-1 pl-6">
            <!-- Metas -->
            <a href="#/metas" class="bottom-nav-item flex-1 min-w-0" data-nav="metas">
              <div class="nav-icon-container p-1 rounded-xl transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span class="text-[10px] font-medium truncate w-full text-center leading-tight transition-opacity">${t('nav.goalsShort')}</span>
            </a>
            
            <!-- Informes -->
            <a href="#/informes" class="bottom-nav-item flex-1 min-w-0" data-nav="informes">
              <div class="nav-icon-container p-1 rounded-xl transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span class="text-[10px] font-medium truncate w-full text-center leading-tight transition-opacity">${t('nav.reportsShort')}</span>
            </a>
            
            <!-- Perfil -->
            <a href="#/perfil" class="bottom-nav-item flex-1 min-w-0" data-nav="perfil">
              <div class="nav-icon-container p-1 rounded-xl transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span class="text-[10px] font-medium truncate w-full text-center leading-tight transition-opacity">${t('nav.profileShort')}</span>
            </a>
          </div>

        </div>
      </nav>
    </div>
  `
}

/**
 * Actualizar el elemento de navegación activo
 * @param {string} path - Ruta actual
 */
export function updateActiveNav(path) {
  // Mapear rutas a IDs de navegación
  const routeToNav = {
    '/dashboard': 'dashboard',
    '/transacciones': 'transacciones',
    '/presupuestos': 'presupuestos',
    '/categorias': 'categorias',
    '/metas': 'metas',
    '/informes': 'informes',
    '/perfil': 'perfil'
  }

  const activeNav = routeToNav[path] || 'dashboard'

  // Actualizar sidebar (desktop)
  document.querySelectorAll('.sidebar .nav-item').forEach(item => {
    item.classList.remove('nav-item-active')
  })

  const activeDesktop = document.querySelector(`.sidebar [data-nav="${activeNav}"]`)
  if (activeDesktop) {
    activeDesktop.classList.add('nav-item-active')
  }

  // Actualizar bottom nav (móvil)
  document.querySelectorAll('.bottom-nav .bottom-nav-item').forEach(item => {
    item.classList.remove('bottom-nav-item-active')
  })

  const activeMobile = document.querySelector(`.bottom-nav [data-nav="${activeNav}"]`)
  if (activeMobile) {
    activeMobile.classList.add('bottom-nav-item-active')
  }

  // Actualizar título de página en header
  const navKeys = {
    'dashboard': 'nav.dashboard',
    'transacciones': 'nav.transactions',
    'presupuestos': 'nav.budgets',
    'categorias': 'nav.categories',
    'metas': 'nav.goals',
    'informes': 'nav.reports',
    'perfil': 'nav.profile'
  }

  const pageTitle = document.getElementById('page-title')
  if (pageTitle) {
    pageTitle.textContent = t(navKeys[activeNav] || 'nav.dashboard')
  }
}

/**
 * Función para cerrar sesión (sin confirmación)
 */
async function doLogout() {
  console.log('🚪 Cerrando sesión...')
  try {
    await authService.logout()
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
    window.location.reload()
  }
}

/**
 * Inicializar eventos del layout
 */
export function initLayoutEvents() {
  if (layoutEventsInitialized) return
  layoutEventsInitialized = true

  console.log('🎨 Inicializando eventos del layout')

  // Toggle tema oscuro/claro
  const btnTheme = document.getElementById('btn-toggle-theme')
  if (btnTheme) {
    btnTheme.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark')
      localStorage.setItem('theme',
        document.documentElement.classList.contains('dark') ? 'dark' : 'light'
      )
    })
  }

  // Cerrar sesión
  const btnLogout = document.getElementById('btn-logout-sidebar')
  if (btnLogout) {
    btnLogout.onclick = () => showLogoutModal()
  }

  // Language buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang
      setLang(lang)
      // Reload the current view to apply translations
      window.location.reload()
    })
  })

  // Inicializar estado de conexión y tema
  initConnectionStatus()
  initTheme()
}

/**
 * Mostrar modal de confirmación de logout premium
 */
function showLogoutModal() {
  const modal = document.createElement('div')
  modal.id = 'logout-modal'
  modal.innerHTML = `
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-dark-900/60 dark:bg-dark-950/80 backdrop-blur-sm z-50 animate-fade-in" id="logout-backdrop"></div>
    
    <!-- Modal Content -->
    <div class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-white dark:bg-dark-900 rounded-3xl p-8 shadow-2xl border border-dark-100 dark:border-dark-800 z-50 animate-scale-in">
      
      <!-- Icon -->
      <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-danger-100 to-danger-50 dark:from-danger-900/40 dark:to-danger-900/20 rounded-3xl flex items-center justify-center">
        <svg class="w-10 h-10 text-danger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </div>
      
      <!-- Title -->
      <h3 class="text-xl font-bold text-dark-900 dark:text-white text-center mb-2">
        ${t('nav.logoutConfirm')}
      </h3>
      
      <!-- Description -->
      <p class="text-dark-500 dark:text-dark-400 text-center mb-8">
        ${t('nav.logoutDesc')}
      </p>
      
      <!-- Buttons -->
      <div class="flex gap-3">
        <button id="logout-cancel" class="flex-1 py-3.5 px-6 rounded-2xl font-semibold text-dark-600 dark:text-dark-300 bg-dark-100 dark:bg-dark-800 hover:bg-dark-200 dark:hover:bg-dark-700 transition-all duration-200">
          ${t('nav.cancel')}
        </button>
        <button id="logout-confirm" class="flex-1 py-3.5 px-6 rounded-2xl font-semibold text-white bg-gradient-to-r from-danger-500 to-danger-600 hover:from-danger-600 hover:to-danger-700 shadow-lg shadow-danger-500/25 hover:shadow-xl hover:shadow-danger-500/30 transition-all duration-200">
          ${t('nav.logout')}
        </button>
      </div>
    </div>
  `

  document.body.appendChild(modal)

  const backdrop = document.getElementById('logout-backdrop')
  const cancelBtn = document.getElementById('logout-cancel')
  const confirmBtn = document.getElementById('logout-confirm')

  const closeModal = () => modal.remove()

  backdrop.onclick = closeModal
  cancelBtn.onclick = closeModal
  confirmBtn.onclick = () => {
    closeModal()
    doLogout()
  }

  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      closeModal()
      document.removeEventListener('keydown', handleEscape)
    }
  }
  document.addEventListener('keydown', handleEscape)
}

/**
 * Inicializar indicador de conexión
 */
function initConnectionStatus() {
  const updateConnectionStatus = () => {
    const indicator = document.getElementById('connection-status')
    if (indicator) {
      if (navigator.onLine) {
        indicator.innerHTML = `
          <span class="w-2 h-2 bg-success-500 rounded-full animate-pulse"></span>
          <span>${t('common.online')}</span>
        `
        indicator.className = 'hidden md:flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400'
      } else {
        indicator.innerHTML = `
          <span class="w-2 h-2 bg-warning-500 rounded-full"></span>
          <span>${t('common.offline')}</span>
        `
        indicator.className = 'hidden md:flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-400'
      }
    }
  }

  window.addEventListener('online', updateConnectionStatus)
  window.addEventListener('offline', updateConnectionStatus)
  updateConnectionStatus()
}

/**
 * Inicializar tema guardado
 */
function initTheme() {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark')
  }
}

export default { renderLayout, updateActiveNav, initLayoutEvents }
