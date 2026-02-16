/**
 * =====================================================
 * FINANZAPRO - Vista de Login/Registro Premium
 * =====================================================
 * Pantalla de autenticación con diseño moderno y animaciones
 */

import { authService } from '../services/supabase.js'

/**
 * Renderizar vista de Login
 * @returns {string} HTML de la vista
 */
export function LoginView() {
  return `
    <div class="min-h-screen lg:h-screen flex flex-col lg:flex-row overflow-auto">
      
      <!-- ===== PANEL IZQUIERDO - BRANDING (Solo Desktop) ===== -->
      <div class="hidden lg:flex lg:w-1/2 xl:w-2/5 relative bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-900 p-12 flex-col justify-between overflow-hidden min-h-screen">
        
        <!-- Formas decorativas -->
        <div class="absolute inset-0 overflow-hidden">
          <div class="absolute -top-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div class="absolute top-1/2 -right-32 w-80 h-80 bg-primary-400/10 rounded-full blur-3xl"></div>
          <div class="absolute -bottom-20 left-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl"></div>
          
          <!-- Patrón de puntos -->
          <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px); background-size: 24px 24px;"></div>
        </div>
        
        <!-- Logo y marca -->
        <div class="relative z-10">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 class="text-3xl font-bold text-white tracking-tight">FinanzaPro</h1>
              <p class="text-primary-200 text-sm">Gestión Financiera Inteligente</p>
            </div>
          </div>
        </div>
        
        <!-- Contenido central -->
        <div class="relative z-10 space-y-8">
          <div>
            <h2 class="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
              Toma el control de tus 
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary-200 to-white">finanzas</span>
            </h2>
            <p class="text-xl text-primary-100/80 leading-relaxed">
              Gestiona ingresos, gastos y presupuestos de forma intuitiva. 
              Sincronización en la nube y acceso desde cualquier dispositivo.
            </p>
          </div>
          
          <!-- Features -->
          <div class="grid grid-cols-2 gap-4">
            <div class="flex items-center gap-3 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div class="w-10 h-10 bg-success-500/20 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-success-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span class="text-white/90 text-sm font-medium">Offline-First</span>
            </div>
            <div class="flex items-center gap-3 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div class="w-10 h-10 bg-primary-400/20 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-primary-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span class="text-white/90 text-sm font-medium">100% Seguro</span>
            </div>
            <div class="flex items-center gap-3 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div class="w-10 h-10 bg-warning-500/20 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-warning-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span class="text-white/90 text-sm font-medium">Estadísticas</span>
            </div>
            <div class="flex items-center gap-3 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div class="w-10 h-10 bg-danger-500/20 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-danger-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <span class="text-white/90 text-sm font-medium">Multiplataforma</span>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="relative z-10">
          <p class="text-primary-200/60 text-sm">
            © 2026 FinanzaPro. Todos los derechos reservados.
          </p>
        </div>
      </div>
      
      <!-- ===== PANEL DERECHO - FORMULARIO ===== -->
      <div class="w-full lg:w-1/2 xl:w-3/5 flex items-center justify-center p-6 md:p-12 bg-white dark:bg-dark-900 lg:overflow-y-auto">
        <div class="w-full max-w-md py-12 my-auto">
          
          <!-- Logo -->
          <div class="text-center mb-8">
            <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-xl shadow-primary-500/25">
              <span class="text-3xl text-white font-bold">$</span>
            </div>
            <h1 class="text-2xl font-bold text-dark-900 dark:text-white">FinanzaPro</h1>
            <p class="text-dark-500 dark:text-dark-400 text-sm">Gestión Financiera Inteligente</p>
          </div>
          
          <!-- Encabezado -->
          <div class="text-center lg:text-left mb-8">
            <h2 class="text-2xl md:text-3xl font-bold text-dark-900 dark:text-white mb-2" id="form-title">
              ¡Bienvenido de nuevo!
            </h2>
            <p class="text-dark-500 dark:text-dark-400" id="form-subtitle">
              Inicia sesión para acceder a tu cuenta
            </p>
          </div>
          
          <!-- Tabs Login/Registro -->
          <div class="flex p-1.5 mb-8 bg-dark-100 dark:bg-dark-800 rounded-2xl">
            <button id="tab-login" class="flex-1 py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-300 bg-white dark:bg-dark-700 text-dark-900 dark:text-white shadow-md">
              Iniciar Sesión
            </button>
            <button id="tab-registro" class="flex-1 py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-300 text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-300">
              Crear Cuenta
            </button>
          </div>
          
          <!-- Mensajes de error/éxito -->
          <div id="auth-message" class="hidden mb-6 p-4 rounded-xl text-sm flex items-center gap-3 animate-fade-in"></div>
          
          <!-- Formulario de Login -->
          <form id="form-login" class="space-y-5">
            <div class="space-y-2">
              <label for="login-email" class="block text-sm font-semibold text-dark-700 dark:text-dark-300">
                Correo electrónico
              </label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-dark-400 group-focus-within:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input 
                  type="email" 
                  id="login-email" 
                  class="input-premium pl-12" 
                  placeholder="tu@email.com"
                  required
                >
              </div>
            </div>
            
            <div class="space-y-2">
              <label for="login-password" class="block text-sm font-semibold text-dark-700 dark:text-dark-300">
                Contraseña
              </label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-dark-400 group-focus-within:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input 
                  type="password" 
                  id="login-password" 
                  class="input-premium pl-12 pr-12" 
                  placeholder="••••••••"
                  required
                  minlength="6"
                >
                <button type="button" class="toggle-password absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600 dark:hover:text-dark-300 transition-colors">
                  <svg class="w-5 h-5 eye-open" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg class="w-5 h-5 eye-closed hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div class="flex items-center justify-between">
              <label class="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" class="w-4 h-4 rounded border-dark-300 dark:border-dark-600 text-primary-500 focus:ring-primary-500 focus:ring-offset-0">
                <span class="text-sm text-dark-600 dark:text-dark-400 group-hover:text-dark-800 dark:group-hover:text-dark-200 transition-colors">Recordarme</span>
              </label>
              <button type="button" id="btn-forgot-password" class="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-colors">
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            
            <button type="submit" class="btn-premium w-full group">
              <span class="flex items-center justify-center gap-2">
                <svg id="login-spinner" class="hidden animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span id="login-text">Iniciar Sesión</span>
                <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </button>
          </form>
          
          <!-- Formulario de Registro (oculto por defecto) -->
          <form id="form-registro" class="space-y-5 hidden">
            <div class="space-y-2">
              <label for="registro-nombre" class="block text-sm font-semibold text-dark-700 dark:text-dark-300">
                Nombre completo
              </label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-dark-400 group-focus-within:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input 
                  type="text" 
                  id="registro-nombre" 
                  class="input-premium pl-12" 
                  placeholder="Juan Pérez"
                  required
                >
              </div>
            </div>
            
            <div class="space-y-2">
              <label for="registro-email" class="block text-sm font-semibold text-dark-700 dark:text-dark-300">
                Correo electrónico
              </label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-dark-400 group-focus-within:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input 
                  type="email" 
                  id="registro-email" 
                  class="input-premium pl-12" 
                  placeholder="tu@email.com"
                  required
                >
              </div>
            </div>
            
            <div class="space-y-2">
              <label for="registro-password" class="block text-sm font-semibold text-dark-700 dark:text-dark-300">
                Contraseña
              </label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-dark-400 group-focus-within:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input 
                  type="password" 
                  id="registro-password" 
                  class="input-premium pl-12 pr-12" 
                  placeholder="Mínimo 6 caracteres"
                  required
                  minlength="6"
                >
                <button type="button" class="toggle-password absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600 dark:hover:text-dark-300 transition-colors">
                  <svg class="w-5 h-5 eye-open" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg class="w-5 h-5 eye-closed hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                </button>
              </div>
              <div class="flex gap-1 mt-2">
                <div class="h-1 flex-1 rounded-full bg-dark-200 dark:bg-dark-700" id="strength-1"></div>
                <div class="h-1 flex-1 rounded-full bg-dark-200 dark:bg-dark-700" id="strength-2"></div>
                <div class="h-1 flex-1 rounded-full bg-dark-200 dark:bg-dark-700" id="strength-3"></div>
                <div class="h-1 flex-1 rounded-full bg-dark-200 dark:bg-dark-700" id="strength-4"></div>
              </div>
            </div>
            
            <div class="space-y-2">
              <label for="registro-password-confirm" class="block text-sm font-semibold text-dark-700 dark:text-dark-300">
                Confirmar contraseña
              </label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-dark-400 group-focus-within:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <input 
                  type="password" 
                  id="registro-password-confirm" 
                  class="input-premium pl-12" 
                  placeholder="Repite tu contraseña"
                  required
                  minlength="6"
                >
              </div>
            </div>
            
            <button type="submit" class="btn-premium w-full group">
              <span class="flex items-center justify-center gap-2">
                <svg id="registro-spinner" class="hidden animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span id="registro-text">Crear Cuenta</span>
                <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </button>
          </form>
          
          <!-- Separador -->
          <div class="relative my-8">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-dark-200 dark:border-dark-700"></div>
            </div>
            <div class="relative flex justify-center">
              <span class="px-4 bg-white dark:bg-dark-900 text-sm text-dark-500 dark:text-dark-400">o continúa con</span>
            </div>
          </div>
          
          <!-- Botones OAuth -->
          <div class="grid grid-cols-1 gap-3">
            <button id="btn-google" type="button" class="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white dark:bg-dark-800 border-2 border-dark-200 dark:border-dark-700 rounded-xl hover:border-dark-300 dark:hover:border-dark-600 hover:shadow-lg transition-all duration-200">
              <svg class="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span class="text-dark-700 dark:text-dark-200 font-semibold">Continuar con Google</span>
            </button>
          </div>
          
          <!-- Footer móvil -->
          <p class="lg:hidden text-center text-dark-400 dark:text-dark-500 text-xs mt-8">
            © 2026 FinanzaPro. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  `
}

/**
 * Inicializar eventos del formulario de Login
 */
export function initLoginEvents() {
  // Referencias a elementos
  const tabLogin = document.getElementById('tab-login')
  const tabRegistro = document.getElementById('tab-registro')
  const formLogin = document.getElementById('form-login')
  const formRegistro = document.getElementById('form-registro')
  const messageBox = document.getElementById('auth-message')
  const formTitle = document.getElementById('form-title')
  const formSubtitle = document.getElementById('form-subtitle')

  // Función para mostrar mensajes
  const showMessage = (message, type = 'error') => {
    const iconError = `<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
    const iconSuccess = `<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`

    messageBox.className = `mb-6 p-4 rounded-xl text-sm flex items-center gap-3 animate-fade-in ${type === 'error'
      ? 'bg-danger-50 dark:bg-danger-900/30 text-danger-700 dark:text-danger-400 border border-danger-200 dark:border-danger-800'
      : 'bg-success-50 dark:bg-success-900/30 text-success-700 dark:text-success-400 border border-success-200 dark:border-success-800'
      }`
    messageBox.innerHTML = `${type === 'error' ? iconError : iconSuccess}<span>${message}</span>`
    messageBox.classList.remove('hidden')
  }

  const hideMessage = () => {
    messageBox?.classList.add('hidden')
  }

  // Cambiar entre tabs
  tabLogin?.addEventListener('click', () => {
    tabLogin.className = 'flex-1 py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-300 bg-white dark:bg-dark-700 text-dark-900 dark:text-white shadow-md'
    tabRegistro.className = 'flex-1 py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-300 text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-300'
    formLogin.classList.remove('hidden')
    formRegistro.classList.add('hidden')
    if (formTitle) formTitle.textContent = '¡Bienvenido de nuevo!'
    if (formSubtitle) formSubtitle.textContent = 'Inicia sesión para acceder a tu cuenta'
    hideMessage()
  })

  tabRegistro?.addEventListener('click', () => {
    tabRegistro.className = 'flex-1 py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-300 bg-white dark:bg-dark-700 text-dark-900 dark:text-white shadow-md'
    tabLogin.className = 'flex-1 py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-300 text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-300'
    formRegistro.classList.remove('hidden')
    formLogin.classList.add('hidden')
    if (formTitle) formTitle.textContent = 'Crea tu cuenta'
    if (formSubtitle) formSubtitle.textContent = 'Empieza a gestionar tus finanzas hoy'
    hideMessage()
  })

  // Toggle visibilidad de contraseña
  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const container = e.currentTarget.closest('.relative')
      const input = container.querySelector('input')
      const eyeOpen = e.currentTarget.querySelector('.eye-open')
      const eyeClosed = e.currentTarget.querySelector('.eye-closed')

      if (input.type === 'password') {
        input.type = 'text'
        eyeOpen?.classList.add('hidden')
        eyeClosed?.classList.remove('hidden')
      } else {
        input.type = 'password'
        eyeOpen?.classList.remove('hidden')
        eyeClosed?.classList.add('hidden')
      }
    })
  })

  // Indicador de fuerza de contraseña
  const passwordInput = document.getElementById('registro-password')
  passwordInput?.addEventListener('input', (e) => {
    const password = e.target.value
    const strength = getPasswordStrength(password)

    for (let i = 1; i <= 4; i++) {
      const bar = document.getElementById(`strength-${i}`)
      if (bar) {
        if (i <= strength) {
          bar.className = `h-1 flex-1 rounded-full transition-all duration-300 ${strength === 1 ? 'bg-danger-500' :
            strength === 2 ? 'bg-warning-500' :
              strength === 3 ? 'bg-primary-500' :
                'bg-success-500'
            }`
        } else {
          bar.className = 'h-1 flex-1 rounded-full bg-dark-200 dark:bg-dark-700 transition-all duration-300'
        }
      }
    }
  })

  // Formulario de Login
  formLogin?.addEventListener('submit', async (e) => {
    e.preventDefault()
    hideMessage()

    const email = document.getElementById('login-email').value.trim()
    const password = document.getElementById('login-password').value

    const spinner = document.getElementById('login-spinner')
    const text = document.getElementById('login-text')

    try {
      spinner.classList.remove('hidden')
      text.textContent = 'Iniciando sesión...'

      const { data, error } = await authService.login(email, password)

      if (error) {
        throw new Error(error.message === 'Invalid login credentials'
          ? 'Credenciales incorrectas. Verifica tu email y contraseña.'
          : error.message)
      }

      showMessage('¡Bienvenido! Redirigiendo...', 'success')

    } catch (error) {
      showMessage(error.message)
    } finally {
      spinner.classList.add('hidden')
      text.textContent = 'Iniciar Sesión'
    }
  })

  // Formulario de Registro
  formRegistro?.addEventListener('submit', async (e) => {
    e.preventDefault()
    hideMessage()

    const nombre = document.getElementById('registro-nombre').value.trim()
    const email = document.getElementById('registro-email').value.trim()
    const password = document.getElementById('registro-password').value
    const passwordConfirm = document.getElementById('registro-password-confirm').value

    if (password !== passwordConfirm) {
      showMessage('Las contraseñas no coinciden')
      return
    }

    const spinner = document.getElementById('registro-spinner')
    const text = document.getElementById('registro-text')

    try {
      spinner.classList.remove('hidden')
      text.textContent = 'Creando cuenta...'

      const { data, error } = await authService.registrar(email, password, {
        full_name: nombre
      })

      if (error) {
        throw new Error(error.message)
      }

      showMessage('¡Cuenta creada! Revisa tu email para confirmar tu cuenta.', 'success')

      setTimeout(() => {
        tabLogin?.click()
      }, 2000)

    } catch (error) {
      showMessage(error.message)
    } finally {
      spinner.classList.add('hidden')
      text.textContent = 'Crear Cuenta'
    }
  })

  // Login con Google
  document.getElementById('btn-google')?.addEventListener('click', async () => {
    try {
      const { error } = await authService.loginConProveedor('google')
      if (error) {
        showMessage(error.message)
      }
    } catch (error) {
      showMessage('Error al conectar con Google')
    }
  })

  // Recuperar contraseña
  document.getElementById('btn-forgot-password')?.addEventListener('click', async () => {
    const email = document.getElementById('login-email').value.trim()

    if (!email) {
      showMessage('Ingresa tu email primero')
      return
    }

    try {
      const { error } = await authService.recuperarPassword(email)

      if (error) {
        throw new Error(error.message)
      }

      showMessage('Te hemos enviado un email con instrucciones para recuperar tu contraseña.', 'success')

    } catch (error) {
      showMessage(error.message)
    }
  })
}

/**
 * Calcular fuerza de contraseña
 */
function getPasswordStrength(password) {
  let strength = 0
  if (password.length >= 6) strength++
  if (password.length >= 8) strength++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++
  if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) strength++
  return strength
}

export default LoginView
