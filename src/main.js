/**
 * =====================================================
 * FINANZAPRO - Punto de Entrada Principal
 * =====================================================
 * Inicializa la aplicación, configura el router,
 * y gestiona el estado de autenticación global.
 */

// Importar estilos
import './styles/main.css'

// Importar i18n
import { initI18n } from './utils/i18n.js'

// Importar servicios
import { authService } from './services/supabase.js'
import { dataManager } from './services/dataManager.js'
import Router from './router/index.js'

// Importar vistas
import { LoginView, initLoginEvents } from './views/Login.js'
import { DashboardView } from './views/Dashboard.js'
import { TransaccionesView, initTransaccionesEvents } from './views/Transacciones.js'
import { NuevaTransaccionView, initNuevaTransaccionEvents } from './views/NuevaTransaccion.js'
import { PresupuestosView, initPresupuestosEvents } from './views/Presupuestos.js'
import { CategoriasView, initCategoriasEvents } from './views/Categorias.js'
import { PerfilView, initPerfilEvents } from './views/Perfil.js'
import { InformesView, initInformesEvents } from './views/Informes.js'
import { MetasView, initMetasEvents } from './views/Metas.js'
import { NotFoundView } from './views/NotFound.js'

// Importar Layout
import { renderLayout, updateActiveNav } from './components/Layout.js'

/**
 * Estado global de la aplicación
 */
let currentUser = null
let isInitialized = false

/**
 * Función de verificación de autenticación (guard)
 * @returns {Promise<boolean>}
 */
async function checkAuth() {
    const user = await authService.obtenerUsuario()
    return !!user
}

/**
 * Inicializar la aplicación
 */
async function initApp() {
    // Evitar inicialización múltiple
    if (isInitialized) {
        console.log('⚠️ App ya inicializada, saltando...')
        return
    }

    console.log('🚀 Iniciando FinanzaPro...')

    const appContainer = document.getElementById('app')
    const loadingScreen = document.getElementById('loading-screen')

    try {
        // Verificar si hay sesión activa
        const session = await authService.obtenerSesion()

        if (session?.user) {
            currentUser = session.user
            console.log('✅ Sesión activa encontrada:', currentUser.email)

            // Renderizar layout principal con sidebar/nav
            appContainer.innerHTML = renderLayout()

            // Inicializar Data Manager con el usuario
            await dataManager.inicializar(currentUser.id)

            // Obtener contenedor de contenido principal
            const mainContent = document.getElementById('main-content')

            // Inicializar router
            Router.init(mainContent, {
                authGuard: checkAuth,
                onRouteChange: (path) => {
                    updateActiveNav(path)
                }
            })

            // Registrar rutas protegidas
            registerRoutes()

            // Redirigir a dashboard si está en login o raíz
            const currentPath = Router.getCurrentPath()
            if (currentPath === '/' || currentPath === '/login' || currentPath === '') {
                Router.navigate('/dashboard')
            }

        } else {
            console.log('ℹ️ No hay sesión activa, mostrando login')

            // Mostrar directamente la vista de login (sin layout)
            const loginHtml = LoginView()
            appContainer.innerHTML = loginHtml

            // Inicializar eventos del login después de renderizar
            setTimeout(() => {
                initLoginEvents()
            }, 100)
        }

        // Marcar como inicializado ANTES de configurar el listener
        isInitialized = true

        // Escuchar cambios en el estado de autenticación (solo una vez)
        authService.onAuthStateChange(async (event, session) => {
            console.log('🔐 Evento de auth:', event)

            if (event === 'SIGNED_IN' && session?.user) {
                // Usuario inició sesión - recargar la página para reiniciar todo limpio
                window.location.reload()

            } else if (event === 'SIGNED_OUT') {
                // Usuario cerró sesión - limpiar datos y recargar
                currentUser = null
                try {
                    await dataManager.limpiarDatos()
                } catch (e) {
                    console.warn('Error limpiando datos:', e)
                }
                // Recargar la página
                window.location.reload()
            }
        })

    } catch (error) {
        console.error('❌ Error iniciando la app:', error)
        appContainer.innerHTML = `
      <div class="flex items-center justify-center min-h-screen p-4">
        <div class="text-center">
          <div class="w-20 h-20 mx-auto mb-6 bg-danger-100 rounded-full flex items-center justify-center">
            <svg class="w-10 h-10 text-danger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-dark-900 mb-2">Error de Conexión</h1>
          <p class="text-dark-500 mb-4">${error.message || 'No se pudo conectar con el servidor'}</p>
          <button onclick="location.reload()" class="btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    `
    } finally {
        // Ocultar pantalla de carga
        if (loadingScreen) {
            loadingScreen.style.opacity = '0'
            setTimeout(() => {
                loadingScreen.remove()
            }, 300)
        }
    }
}

/**
 * Registrar todas las rutas de la aplicación
 */
function registerRoutes() {
    Router.registerAll({
        '/dashboard': {
            view: DashboardView,
            title: 'Dashboard - FinanzaPro',
            requiresAuth: true
        },
        '/transacciones': {
            view: TransaccionesView,
            title: 'Transacciones - FinanzaPro',
            requiresAuth: true,
            onMount: () => setTimeout(initTransaccionesEvents, 100)
        },
        '/nueva-transaccion': {
            view: NuevaTransaccionView,
            title: 'Nueva Transacción - FinanzaPro',
            requiresAuth: true,
            onMount: () => setTimeout(initNuevaTransaccionEvents, 100)
        },
        '/editar-transaccion/:id': {
            view: NuevaTransaccionView,
            title: 'Editar Transacción - FinanzaPro',
            requiresAuth: true,
            onMount: () => setTimeout(initNuevaTransaccionEvents, 100)
        },
        '/presupuestos': {
            view: PresupuestosView,
            title: 'Presupuestos - FinanzaPro',
            requiresAuth: true,
            onMount: () => setTimeout(initPresupuestosEvents, 100)
        },
        '/categorias': {
            view: CategoriasView,
            title: 'Categorías - FinanzaPro',
            requiresAuth: true,
            onMount: () => setTimeout(initCategoriasEvents, 100)
        },
        '/perfil': {
            view: PerfilView,
            title: 'Mi Perfil - FinanzaPro',
            requiresAuth: true,
            onMount: () => setTimeout(initPerfilEvents, 100)
        },
        '/informes': {
            view: InformesView,
            title: 'Informes - FinanzaPro',
            requiresAuth: true,
            onMount: () => setTimeout(initInformesEvents, 100)
        },
        '/metas': {
            view: MetasView,
            title: 'Metas - FinanzaPro',
            requiresAuth: true,
            onMount: () => setTimeout(initMetasEvents, 100)
        },
        '/login': {
            view: LoginView,
            title: 'Iniciar Sesión - FinanzaPro',
            requiresAuth: false,
            onMount: () => setTimeout(initLoginEvents, 100)
        },
        '/404': {
            view: NotFoundView,
            title: 'Página no encontrada - FinanzaPro',
            requiresAuth: false
        }
    })
}

/**
 * Obtener usuario actual
 * @returns {object|null}
 */
export function getCurrentUser() {
    return currentUser
}

/**
 * Cerrar sesión
 */
export async function logout() {
    await authService.logout()
}

// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initApp)

/**
 * Global toast notification
 * @param {string} message - Text of the notification
 * @param {'success'|'error'|'warning'} type - Type of toast
 */
window.showToast = function (message, type = 'success') {
    const existing = document.querySelector('.toast')
    if (existing) existing.remove()

    const toast = document.createElement('div')
    toast.className = `toast toast-${type}`
    toast.textContent = message
    document.body.appendChild(toast)

    setTimeout(() => { toast.remove() }, 3000)
}

// Exportar para uso global
window.FinanzaPro = {
    getCurrentUser,
    logout,
    Router
}
