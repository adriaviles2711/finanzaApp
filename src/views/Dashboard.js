/**
 * =====================================================
 * FINANZAPRO - Vista Dashboard Premium
 * =====================================================
 * Panel principal con resumen financiero, gráficos y accesos rápidos
 */

import { dataManager } from '../services/dataManager.js'
import { formatearMoneda, formatearFecha, obtenerSaludo, obtenerMes, agruparPor } from '../utils/helpers.js'
import { t } from '../utils/i18n.js'
/**
 * Renderizar vista de Dashboard
 * @returns {Promise<string>} HTML de la vista
 */
export async function DashboardView() {
  // Obtener datos
  const resumen = await dataManager.obtenerResumenMes()
  const transacciones = await dataManager.obtenerTransacciones({ limite: 5 })
  const categorias = await dataManager.obtenerCategorias()

  // Calcular gastos por categoría del mes actual
  const mesActual = new Date().getMonth()
  const anioActual = new Date().getFullYear()

  const transaccionesMes = transacciones.filter(t => {
    const fecha = new Date(t.fecha)
    return fecha.getMonth() === mesActual &&
      fecha.getFullYear() === anioActual &&
      t.tipo === 'gasto'
  })

  const gastosPorCategoria = {}
  transaccionesMes.forEach(t => {
    const catId = t.category_id || 'sin-categoria'
    gastosPorCategoria[catId] = (gastosPorCategoria[catId] || 0) + parseFloat(t.monto)
  })

  // Top 4 categorías con más gastos
  const topCategorias = Object.entries(gastosPorCategoria)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([catId, monto]) => {
      const cat = categorias.find(c => c.id === catId)
      return {
        nombre: cat?.nombre || 'Sin categoría',
        icono: cat?.icono || '📦',
        color: cat?.color || '#6366f1',
        monto
      }
    })

  const fechaHoy = new Date()
  const saludo = obtenerSaludo()
  const mesNombre = obtenerMes(fechaHoy.getMonth())

  // Calcular tendencia (comparar con mes anterior - simplificado)
  const tendencia = resumen.balance >= 0 ? 'positiva' : 'negativa'

  return `
    <div class="max-w-7xl mx-auto space-y-6 pb-24 md:pb-8 animate-fade-in">
      
      <!-- ===== SALUDO Y FECHA ===== -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-dark-900 dark:text-white flex items-center gap-2">
            ${saludo} 
            <span class="text-3xl md:text-4xl animate-float">👋</span>
          </h1>
          <p class="text-dark-500 dark:text-dark-400 mt-1">
            ${fechaHoy.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <a href="#/nueva-transaccion" class="btn-primary md:btn-premium hidden md:inline-flex">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          ${t('nav.newTransaction')}
        </a>
      </div>
      
      <!-- ===== TARJETA BALANCE PRINCIPAL ===== -->
      <div class="card-gradient">
        <!-- Elementos decorativos -->
        <div class="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-16 -left-16 w-48 h-48 bg-indigo-400/10 rounded-full blur-3xl"></div>
        <div class="absolute top-4 right-4 w-24 h-24 border border-white/10 rounded-full"></div>
        <div class="absolute top-8 right-8 w-16 h-16 border border-white/10 rounded-full"></div>
        
        <div class="relative z-10">
          <div class="flex items-center justify-between mb-2">
            <span class="text-primary-100 text-sm font-medium">${t('dashboard.summary.balanceMonth')}</span>
            <span class="badge ${tendencia === 'positiva' ? 'bg-white/20 text-white' : 'bg-danger-500/30 text-danger-100'}">
              ${tendencia === 'positiva' ? '↗ ' + t('dashboard.positive') : '↘ ' + t('dashboard.negative')}
            </span>
          </div>
          <h2 class="text-4xl md:text-5xl font-bold text-white mb-1 tracking-tight">
            ${formatearMoneda(resumen.balance)}
          </h2>
          <p class="text-primary-200/80 text-sm">${mesNombre} ${anioActual}</p>
          
          <!-- Ingresos y Gastos -->
          <div class="grid grid-cols-2 gap-4 mt-6">
            <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-8 h-8 bg-success-500/30 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-success-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                </div>
                <span class="text-primary-100 text-sm">${t('dashboard.summary.income')}</span>
              </div>
              <p class="text-xl md:text-2xl font-bold text-white">+${formatearMoneda(resumen.ingresos)}</p>
            </div>
            <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-8 h-8 bg-danger-500/30 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-danger-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                  </svg>
                </div>
                <span class="text-primary-100 text-sm">${t('dashboard.summary.expenses')}</span>
              </div>
              <p class="text-xl md:text-2xl font-bold text-white">-${formatearMoneda(resumen.gastos)}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- ===== ACCIONES RÁPIDAS ===== -->
      <div class="grid grid-cols-4 gap-3 md:gap-4">
        <a href="#/nueva-transaccion?tipo=gasto" class="quick-action group">
          <div class="quick-action-icon bg-danger-100 dark:bg-danger-900/30">
            <svg class="w-6 h-6 text-danger-600 dark:text-danger-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
            </svg>
          </div>
          <span class="text-xs md:text-sm font-medium text-dark-600 dark:text-dark-300 text-center">${t('dashboard.quickActions.expense')}</span>
        </a>
        <a href="#/nueva-transaccion?tipo=ingreso" class="quick-action group">
          <div class="quick-action-icon bg-success-100 dark:bg-success-900/30">
            <svg class="w-6 h-6 text-success-600 dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span class="text-xs md:text-sm font-medium text-dark-600 dark:text-dark-300 text-center">${t('dashboard.quickActions.income')}</span>
        </a>
        <a href="#/presupuestos" class="quick-action group">
          <div class="quick-action-icon bg-primary-100 dark:bg-primary-900/30">
            <svg class="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span class="text-xs md:text-sm font-medium text-dark-600 dark:text-dark-300 text-center">${t('dashboard.quickActions.budget')}</span>
        </a>
        <a href="#/categorias" class="quick-action group">
          <div class="quick-action-icon bg-warning-100 dark:bg-warning-900/30">
            <svg class="w-6 h-6 text-warning-600 dark:text-warning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <span class="text-xs md:text-sm font-medium text-dark-600 dark:text-dark-300 text-center">${t('dashboard.quickActions.categories')}</span>
        </a>
      </div>
      
      <!-- ===== CONTENIDO EN DOS COLUMNAS ===== -->
      <div class="grid md:grid-cols-2 gap-6">
        
        <!-- Gastos por categoría -->
        <div class="card">
          <div class="flex items-center justify-between mb-6">
            <h3 class="font-bold text-dark-900 dark:text-white">${t('dashboard.charts.expensesByCategory')}</h3>
            <span class="text-sm text-dark-500 dark:text-dark-400">${t('dashboard.charts.thisMonth')}</span>
          </div>
          
          ${topCategorias.length > 0 ? `
            <div class="space-y-4">
              ${topCategorias.map(cat => {
    const porcentaje = resumen.gastos > 0 ? (cat.monto / resumen.gastos) * 100 : 0
    return `
                  <div class="group">
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style="background-color: ${cat.color}20;">
                          ${cat.icono}
                        </div>
                        <span class="font-medium text-dark-700 dark:text-dark-200">${cat.nombre}</span>
                      </div>
                      <span class="font-semibold text-dark-900 dark:text-white">${formatearMoneda(cat.monto)}</span>
                    </div>
                    <div class="progress-bar">
                      <div class="progress-fill" style="width: ${porcentaje}%; background: linear-gradient(90deg, ${cat.color}, ${cat.color}cc);"></div>
                    </div>
                  </div>
                `
  }).join('')}
            </div>
          ` : `
            <div class="empty-state py-8">
              <div class="w-16 h-16 bg-dark-100 dark:bg-dark-800 rounded-2xl flex items-center justify-center mb-4">
                <svg class="w-8 h-8 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p class="text-dark-500 dark:text-dark-400">${t('dashboard.charts.noExpenses')}</p>
            </div>
          `}
        </div>
        
        <!-- Transacciones recientes -->
        <div class="card">
          <div class="flex items-center justify-between mb-6">
            <h3 class="font-bold text-dark-900 dark:text-white">${t('dashboard.charts.recentTransactions')}</h3>
            <a href="#/transacciones" class="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium">
              ${t('dashboard.charts.viewAll')} →
            </a>
          </div>
          
          ${transacciones.length > 0 ? `
            <div class="space-y-3">
              ${transacciones.slice(0, 5).map(t => {
    const categoria = categorias.find(c => c.id === t.category_id)
    const esIngreso = t.tipo === 'ingreso'
    return `
                  <a href="#/editar-transaccion/${t.id}" class="transaction-item">
                    <div class="transaction-icon" style="background-color: ${categoria?.color || '#6366f1'}20;">
                      ${categoria?.icono || '💰'}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="font-medium text-dark-900 dark:text-white truncate">${t.descripcion || categoria?.nombre || t('dashboard.charts.transaction')}</p>
                      <p class="text-sm text-dark-500 dark:text-dark-400">${formatearFecha(t.fecha)}</p>
                    </div>
                    <span class="font-bold ${esIngreso ? 'text-success-600 dark:text-success-400' : 'text-dark-900 dark:text-white'}">
                      ${esIngreso ? '+' : '-'}${formatearMoneda(t.monto)}
                    </span>
                  </a>
                `
  }).join('')}
            </div>
          ` : `
            <div class="empty-state py-8">
              <div class="w-16 h-16 bg-dark-100 dark:bg-dark-800 rounded-2xl flex items-center justify-center mb-4">
                <svg class="w-8 h-8 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p class="text-dark-500 dark:text-dark-400 mb-4">${t('dashboard.charts.noTransactions')}</p>
              <a href="#/nueva-transaccion" class="btn-primary">
                ${t('dashboard.charts.addFirst')}
              </a>
            </div>
          `}
        </div>
        
      </div>
      
      <!-- ===== RESUMEN ESTADÍSTICO ===== -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="stat-card">
          <div class="flex items-center justify-between mb-3">
            <div class="stat-icon bg-primary-100 dark:bg-primary-900/30">
              <svg class="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <p class="text-2xl font-bold text-dark-900 dark:text-white">${resumen.totalTransacciones || 0}</p>
          <p class="text-sm text-dark-500 dark:text-dark-400">${t('dashboard.stats.transactions')}</p>
        </div>
        
        <div class="stat-card">
          <div class="flex items-center justify-between mb-3">
            <div class="stat-icon bg-success-100 dark:bg-success-900/30">
              <svg class="w-6 h-6 text-success-600 dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <p class="text-2xl font-bold text-success-600 dark:text-success-400">
            ${resumen.ingresos > 0 ? Math.round((resumen.ingresos / (resumen.ingresos + resumen.gastos || 1)) * 100) : 0}%
          </p>
          <p class="text-sm text-dark-500 dark:text-dark-400">${t('dashboard.stats.savingsRate')}</p>
        </div>
        
        <div class="stat-card">
          <div class="flex items-center justify-between mb-3">
            <div class="stat-icon bg-warning-100 dark:bg-warning-900/30">
              <svg class="w-6 h-6 text-warning-600 dark:text-warning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          </div>
          <p class="text-2xl font-bold text-dark-900 dark:text-white">${categorias.length}</p>
          <p class="text-sm text-dark-500 dark:text-dark-400">${t('dashboard.stats.categories')}</p>
        </div>
        
        <div class="stat-card">
          <div class="flex items-center justify-between mb-3">
            <div class="stat-icon bg-danger-100 dark:bg-danger-900/30">
              <svg class="w-6 h-6 text-danger-600 dark:text-danger-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p class="text-2xl font-bold text-dark-900 dark:text-white">
            ${resumen.gastos > 0 ? formatearMoneda(resumen.gastos / (transaccionesMes.length || 1)) : formatearMoneda(0)}
          </p>
          <p class="text-sm text-dark-500 dark:text-dark-400">${t('dashboard.stats.avgExpense')}</p>
        </div>
      </div>
      
    </div>
  `
}

export default DashboardView
