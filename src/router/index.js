/**
 * =====================================================
 * FINANZAPRO - Hash Router
 * =====================================================
 * Router basado en Hash (#) para navegación SPA
 * Compatible con Capacitor/Android (file://) y hosting estático
 * 
 * ¿Por qué Hash Router?
 * - Funciona sin servidor (ideal para apps móviles con file://)
 * - No requiere configuración de servidor para routing
 * - El hash (#/ruta) no envía peticiones al servidor
 */

// Almacén de rutas registradas
const routes = new Map()

// Middleware de autenticación
let authGuard = null

// Contenedor donde se renderizarán las vistas
let appContainer = null

// Callback para eventos de cambio de ruta
let onRouteChangeCallback = null

/**
 * Router Principal
 */
export const Router = {

    /**
     * Inicializar el router
     * @param {HTMLElement} container - Contenedor donde se renderizarán las vistas
     * @param {object} opciones - Opciones de configuración
     */
    init(container, opciones = {}) {
        appContainer = container

        if (opciones.authGuard) {
            authGuard = opciones.authGuard
        }

        if (opciones.onRouteChange) {
            onRouteChangeCallback = opciones.onRouteChange
        }

        // Escuchar cambios en el hash
        window.addEventListener('hashchange', () => this.handleRouteChange())

        // Manejar la ruta inicial
        this.handleRouteChange()

        console.log('🔀 Router inicializado')
    },

    /**
     * Registrar una ruta
     * @param {string} path - Ruta (ej: '/dashboard', '/transacciones')
     * @param {object} config - Configuración de la ruta
     *   - view: Función que retorna el HTML de la vista
     *   - title: Título de la página
     *   - requiresAuth: Si requiere autenticación
     *   - onMount: Función a ejecutar al montar la vista
     */
    register(path, config) {
        routes.set(path, {
            view: config.view,
            title: config.title || 'FinanzaPro',
            requiresAuth: config.requiresAuth !== false, // Por defecto requiere auth
            onMount: config.onMount || null,
            onUnmount: config.onUnmount || null
        })
    },

    /**
     * Registrar múltiples rutas
     * @param {object} routesConfig - Objeto con rutas { '/path': config, ... }
     */
    registerAll(routesConfig) {
        Object.entries(routesConfig).forEach(([path, config]) => {
            this.register(path, config)
        })
    },

    /**
     * Navegar a una ruta
     * @param {string} path - Ruta destino
     * @param {object} params - Parámetros opcionales
     */
    navigate(path, params = {}) {
        // Construir query string si hay parámetros
        let queryString = ''
        if (Object.keys(params).length > 0) {
            queryString = '?' + new URLSearchParams(params).toString()
        }

        // Cambiar el hash (esto dispara hashchange)
        window.location.hash = `#${path}${queryString}`
    },

    /**
     * Obtener la ruta actual
     * @returns {string} Ruta actual sin el hash ni parámetros
     */
    getCurrentPath() {
        const hash = window.location.hash.slice(1) || '/'
        return hash.split('?')[0]
    },

    /**
     * Obtener los parámetros de la URL actual
     * @returns {object} Objeto con los parámetros
     */
    getParams() {
        const hash = window.location.hash.slice(1) || '/'
        const queryStart = hash.indexOf('?')

        if (queryStart === -1) {
            return {}
        }

        const queryString = hash.slice(queryStart + 1)
        return Object.fromEntries(new URLSearchParams(queryString))
    },

    /**
     * Manejar cambio de ruta
     */
    async handleRouteChange() {
        const path = this.getCurrentPath()
        let params = this.getParams()

        console.log(`🔀 Navegando a: ${path}`, params)

        // Buscar la ruta registrada
        let routeConfig = routes.get(path)
        let extractedParams = {}

        // Si no existe, buscar ruta con parámetros dinámicos o usar 404
        if (!routeConfig) {
            const dynamicRoute = this.findDynamicRoute(path)
            if (dynamicRoute) {
                routeConfig = dynamicRoute
                // Extraer los parámetros dinámicos de la ruta
                extractedParams = dynamicRoute._extractedParams || {}
            } else {
                routeConfig = routes.get('/404')
            }

            // Si tampoco hay 404, redirigir al inicio
            if (!routeConfig) {
                this.navigate('/')
                return
            }
        }

        // Combinar parámetros de query string con parámetros dinámicos de ruta
        params = { ...params, ...extractedParams }

        // Verificar autenticación si es necesario
        if (routeConfig.requiresAuth && authGuard) {
            const isAuthenticated = await authGuard()
            if (!isAuthenticated) {
                console.log('🔒 Acceso denegado. Redirigiendo a login...')
                this.navigate('/login')
                return
            }
        }

        // Ejecutar onUnmount de la vista anterior si existe
        if (this._currentRoute?.onUnmount) {
            try {
                this._currentRoute.onUnmount()
            } catch (e) {
                console.warn('⚠️ Error en onUnmount:', e)
            }
        }

        // Actualizar título de la página
        document.title = routeConfig.title

        // Renderizar la vista
        try {
            const viewContent = await routeConfig.view(params)

            // Pasar onMount como callback para ejecutar después del render
            const onMountCallback = routeConfig.onMount ? () => routeConfig.onMount(params) : null
            this.renderView(viewContent, onMountCallback)

            // Guardar referencia a la ruta actual
            this._currentRoute = routeConfig

            // Callback de cambio de ruta
            if (onRouteChangeCallback) {
                onRouteChangeCallback(path, params)
            }

        } catch (error) {
            console.error('❌ Error renderizando vista:', error)
            this.renderError(error)
        }
    },

    /**
     * Buscar ruta dinámica (con parámetros como :id)
     * @param {string} path - Ruta a buscar
     * @returns {object|null} Configuración de la ruta o null
     */
    findDynamicRoute(path) {
        for (const [routePath, config] of routes) {
            // Convertir /ruta/:param a regex
            if (routePath.includes(':')) {
                const regexPath = routePath.replace(/:([^/]+)/g, '([^/]+)')
                const regex = new RegExp(`^${regexPath}$`)

                if (regex.test(path)) {
                    // Extraer parámetros
                    const paramNames = routePath.match(/:([^/]+)/g)?.map(p => p.slice(1)) || []
                    const paramValues = path.match(regex)?.slice(1) || []

                    const routeParams = {}
                    paramNames.forEach((name, i) => {
                        routeParams[name] = paramValues[i]
                    })

                    // Retornar config con parámetros adjuntos
                    return {
                        ...config,
                        _extractedParams: routeParams
                    }
                }
            }
        }
        return null
    },

    /**
     * Renderizar contenido en el contenedor
     * @param {string} html - HTML a renderizar
     * @param {function} onMountCallback - Callback a ejecutar después de renderizar
     */
    renderView(html, onMountCallback = null) {
        if (!appContainer) {
            console.error('❌ No hay contenedor de app definido')
            return
        }

        // Añadir clase de animación de salida
        appContainer.classList.add('view-exit')

        // Esperar a que termine la animación
        setTimeout(() => {
            appContainer.innerHTML = html
            appContainer.classList.remove('view-exit')
            appContainer.classList.add('view-enter')

            // Ejecutar onMount después de que el HTML esté en el DOM
            if (onMountCallback) {
                // Usar setTimeout para asegurar que el DOM esté completamente listo
                setTimeout(() => {
                    onMountCallback()
                }, 50)
            }

            // Quitar clase de entrada después de la animación
            setTimeout(() => {
                appContainer.classList.remove('view-enter')
            }, 300)
        }, 200)
    },

    /**
     * Renderizar página de error
     * @param {Error} error - Error a mostrar
     */
    renderError(error) {
        const html = `
      <div class="flex items-center justify-center min-h-screen p-4">
        <div class="text-center">
          <div class="w-20 h-20 mx-auto mb-6 bg-danger-100 dark:bg-danger-900/30 rounded-full flex items-center justify-center">
            <svg class="w-10 h-10 text-danger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-dark-900 dark:text-white mb-2">
            ¡Ups! Algo salió mal
          </h1>
          <p class="text-dark-500 dark:text-dark-400 mb-6">
            ${error.message || 'Error desconocido'}
          </p>
          <button onclick="window.location.hash='#/'" class="btn-primary">
            Volver al inicio
          </button>
        </div>
      </div>
    `

        if (appContainer) {
            appContainer.innerHTML = html
        }
    },

    /**
     * Force refresh the current route (re-render without hash change)
     */
    refresh() {
        this.handleRouteChange()
    },

    /**
     * Volver atrás en el historial
     */
    back() {
        window.history.back()
    },

    /**
     * Ir adelante en el historial
     */
    forward() {
        window.history.forward()
    }
}

/**
 * Helper para crear enlaces de navegación
 * @param {string} path - Ruta destino
 * @param {string} text - Texto del enlace
 * @param {string} className - Clases CSS adicionales
 * @returns {string} HTML del enlace
 */
export function routerLink(path, text, className = '') {
    return `<a href="#${path}" class="${className}">${text}</a>`
}

/**
 * Verificar si una ruta está activa
 * @param {string} path - Ruta a verificar
 * @returns {boolean}
 */
export function isActiveRoute(path) {
    const current = Router.getCurrentPath()
    return current === path || current.startsWith(path + '/')
}

// Exportar por defecto
export default Router
