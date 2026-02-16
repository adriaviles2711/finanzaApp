/**
 * =====================================================
 * FINANZAPRO - Vista 404 Not Found
 * =====================================================
 */

/**
 * Renderizar vista 404
 * @returns {string} HTML de la vista
 */
export function NotFoundView() {
    return `
    <div class="flex items-center justify-center min-h-[60vh] p-4 animate-fade-in">
      <div class="text-center">
        <div class="text-8xl mb-6">🔍</div>
        <h1 class="text-4xl font-bold text-dark-900 dark:text-white mb-2">404</h1>
        <p class="text-xl text-dark-600 dark:text-dark-400 mb-6">Página no encontrada</p>
        <p class="text-dark-500 dark:text-dark-400 mb-8 max-w-md mx-auto">
          La página que buscas no existe o ha sido movida. Verifica la URL o vuelve al inicio.
        </p>
        <a href="#/dashboard" class="btn-primary">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Volver al inicio
        </a>
      </div>
    </div>
  `
}

export default NotFoundView
