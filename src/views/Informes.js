/**
 * =====================================================
 * FINANZAPRO - Vista Informes (Enhanced)
 * =====================================================
 * Reports with monthly comparison, currency converter,
 * CSV export, savings calculator, and spending trend chart
 */

import { dataManager } from '../services/dataManager.js'
import { formatearMoneda } from '../utils/helpers.js'
import { t, getMonthName } from '../utils/i18n.js'

// Exchange rates
let exchangeRates = {
  EUR: 1, USD: 1.08, GBP: 0.85, MXN: 18.5, BRL: 5.42
}

async function fetchExchangeRates() {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/EUR')
    if (response.ok) {
      const data = await response.json()
      exchangeRates = {
        EUR: 1,
        USD: data.rates.USD || 1.08,
        GBP: data.rates.GBP || 0.85,
        MXN: data.rates.MXN || 18.5,
        BRL: data.rates.BRL || 5.42
      }
    }
  } catch (error) {
    console.warn('Exchange rates unavailable, using defaults')
  }
}

/**
 * Generate SVG sparkline for spending trend
 */
function generateSpendingTrendSVG(monthlyData) {
  if (!monthlyData || monthlyData.length === 0) return ''

  const maxVal = Math.max(...monthlyData.map(d => d.gastos), 1)
  const width = 600
  const height = 200
  const padding = 40
  const chartW = width - padding * 2
  const chartH = height - padding * 2

  const points = monthlyData.map((d, i) => {
    const x = padding + (i / Math.max(monthlyData.length - 1, 1)) * chartW
    const y = padding + chartH - (d.gastos / maxVal) * chartH
    return { x, y, ...d }
  })

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const areaD = pathD + ` L${points[points.length - 1].x},${height - padding} L${points[0].x},${height - padding} Z`

  return `
        <svg viewBox="0 0 ${width} ${height}" class="w-full h-48" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:rgb(99,102,241);stop-opacity:0.3" />
                    <stop offset="100%" style="stop-color:rgb(99,102,241);stop-opacity:0.02" />
                </linearGradient>
            </defs>
            <!-- Grid lines -->
            ${[0, 0.25, 0.5, 0.75, 1].map(pct => {
    const y = padding + chartH * (1 - pct)
    return `<line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" stroke="currentColor" stroke-opacity="0.08" stroke-dasharray="4"/>`
  }).join('')}
            <!-- Area -->
            <path d="${areaD}" fill="url(#trendGradient)" />
            <!-- Line -->
            <path d="${pathD}" fill="none" stroke="rgb(99,102,241)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <!-- Points and labels -->
            ${points.map(p => `
                <circle cx="${p.x}" cy="${p.y}" r="4" fill="rgb(99,102,241)" stroke="white" stroke-width="2"/>
                <text x="${p.x}" y="${height - 10}" text-anchor="middle" class="fill-current text-dark-500" style="font-size:11px">${p.label}</text>
            `).join('')}
        </svg>
    `
}

/**
 * Renderizar vista de Informes
 */
export async function InformesView() {
  const ahora = new Date()
  const mesActual = ahora.getMonth() + 1
  const anioActual = ahora.getFullYear()
  const mesAnterior = mesActual === 1 ? 12 : mesActual - 1
  const anioAnterior = mesActual === 1 ? anioActual - 1 : anioActual

  const resumenActual = await dataManager.obtenerResumenMes(mesActual, anioActual)
  const resumenAnterior = await dataManager.obtenerResumenMes(mesAnterior, anioAnterior)

  const cambioIngresos = resumenAnterior.ingresos > 0
    ? ((resumenActual.ingresos - resumenAnterior.ingresos) / resumenAnterior.ingresos * 100).toFixed(1) : 0
  const cambioGastos = resumenAnterior.gastos > 0
    ? ((resumenActual.gastos - resumenAnterior.gastos) / resumenAnterior.gastos * 100).toFixed(1) : 0
  const cambioBalance = resumenAnterior.balance !== 0
    ? ((resumenActual.balance - resumenAnterior.balance) / Math.abs(resumenAnterior.balance) * 100).toFixed(1) : 0

  // Spending trend (last 6 months)
  const monthlyData = []
  for (let i = 5; i >= 0; i--) {
    let m = mesActual - i
    let y = anioActual
    if (m <= 0) { m += 12; y-- }
    const resumen = await dataManager.obtenerResumenMes(m, y)
    monthlyData.push({
      mes: m, anio: y,
      gastos: resumen.gastos || 0,
      ingresos: resumen.ingresos || 0,
      label: getMonthName(m).substring(0, 3)
    })
  }

  await fetchExchangeRates()

  return `
    <div class="max-w-4xl mx-auto space-y-6 pb-24 md:pb-8 animate-fade-in">
      
      <!-- Header -->
      <div>
        <h1 class="text-2xl md:text-3xl font-bold text-dark-900 dark:text-white">${t('reports.title')}</h1>
        <p class="text-dark-500 dark:text-dark-400 mt-1">${t('reports.subtitle')}</p>
      </div>
      
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-success-100 dark:bg-success-900/30 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </div>
            <span class="px-2 py-1 text-xs font-medium rounded-full ${parseFloat(cambioIngresos) >= 0 ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400' : 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400'}">
              ${parseFloat(cambioIngresos) >= 0 ? '↑' : '↓'} ${Math.abs(cambioIngresos)}%
            </span>
          </div>
          <p class="text-sm text-dark-500 dark:text-dark-400">${t('reports.income')}</p>
          <p class="text-2xl font-bold text-success-600 dark:text-success-400">${formatearMoneda(resumenActual.ingresos)}</p>
          <p class="text-xs text-dark-400 mt-1">${t('reports.vsLastMonth')} ${formatearMoneda(resumenAnterior.ingresos)}</p>
        </div>
        
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-danger-100 dark:bg-danger-900/30 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-danger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            </div>
            <span class="px-2 py-1 text-xs font-medium rounded-full ${parseFloat(cambioGastos) <= 0 ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400' : 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400'}">
              ${parseFloat(cambioGastos) >= 0 ? '↑' : '↓'} ${Math.abs(cambioGastos)}%
            </span>
          </div>
          <p class="text-sm text-dark-500 dark:text-dark-400">${t('reports.expenses')}</p>
          <p class="text-2xl font-bold text-danger-600 dark:text-danger-400">${formatearMoneda(resumenActual.gastos)}</p>
          <p class="text-xs text-dark-400 mt-1">${t('reports.vsLastMonth')} ${formatearMoneda(resumenAnterior.gastos)}</p>
        </div>
        
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span class="px-2 py-1 text-xs font-medium rounded-full ${parseFloat(cambioBalance) >= 0 ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400' : 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400'}">
              ${parseFloat(cambioBalance) >= 0 ? '↑' : '↓'} ${Math.abs(cambioBalance)}%
            </span>
          </div>
          <p class="text-sm text-dark-500 dark:text-dark-400">${t('reports.balance')}</p>
          <p class="text-2xl font-bold ${resumenActual.balance >= 0 ? 'text-primary-600 dark:text-primary-400' : 'text-danger-600 dark:text-danger-400'}">${formatearMoneda(resumenActual.balance)}</p>
          <p class="text-xs text-dark-400 mt-1">${t('reports.vsLastMonth')} ${formatearMoneda(resumenAnterior.balance)}</p>
        </div>
      </div>

      <!-- Spending Trend Chart -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-lg text-dark-900 dark:text-white">${t('reports.spendingTrend')}</h3>
          <span class="text-sm text-dark-500 dark:text-dark-400">${t('reports.last6Months')}</span>
        </div>
        <div class="text-dark-500 dark:text-dark-400">
          ${generateSpendingTrendSVG(monthlyData)}
        </div>
      </div>
      
      <!-- Comparison Chart -->
      <div class="card">
        <h3 class="font-bold text-lg text-dark-900 dark:text-white mb-4">${t('reports.monthlyComparison')}</h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 bg-dark-50 dark:bg-dark-800 rounded-xl">
            <p class="text-sm text-dark-500 dark:text-dark-400 mb-3 font-medium">${getMonthName(mesAnterior)}</p>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-success-600">${t('reports.income')}</span>
                <span class="font-medium text-dark-900 dark:text-white">${formatearMoneda(resumenAnterior.ingresos)}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-danger-600">${t('reports.expenses')}</span>
                <span class="font-medium text-dark-900 dark:text-white">${formatearMoneda(resumenAnterior.gastos)}</span>
              </div>
              <hr class="border-dark-200 dark:border-dark-700">
              <div class="flex justify-between">
                <span class="font-medium">${t('reports.balance')}</span>
                <span class="font-bold ${resumenAnterior.balance >= 0 ? 'text-success-600' : 'text-danger-600'}">${formatearMoneda(resumenAnterior.balance)}</span>
              </div>
            </div>
          </div>
          <div class="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border-2 border-primary-200 dark:border-primary-800">
            <p class="text-sm text-primary-600 dark:text-primary-400 mb-3 font-medium">${getMonthName(mesActual)} (${t('reports.currentMonth')})</p>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-success-600">${t('reports.income')}</span>
                <span class="font-medium text-dark-900 dark:text-white">${formatearMoneda(resumenActual.ingresos)}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-danger-600">${t('reports.expenses')}</span>
                <span class="font-medium text-dark-900 dark:text-white">${formatearMoneda(resumenActual.gastos)}</span>
              </div>
              <hr class="border-primary-200 dark:border-primary-700">
              <div class="flex justify-between">
                <span class="font-medium">${t('reports.balance')}</span>
                <span class="font-bold ${resumenActual.balance >= 0 ? 'text-success-600' : 'text-danger-600'}">${formatearMoneda(resumenActual.balance)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Savings Calculator -->
      <div class="card">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-gradient-to-br from-success-500 to-emerald-500 rounded-xl flex items-center justify-center">
            <span class="text-white text-lg">🏦</span>
          </div>
          <h3 class="font-bold text-lg text-dark-900 dark:text-white">${t('reports.savingsCalc')}</h3>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label class="label">${t('reports.initialAmount')}</label>
            <input type="number" id="calc-initial" class="input" value="1000" min="0" step="100">
          </div>
          <div>
            <label class="label">${t('reports.monthlyContribution')}</label>
            <input type="number" id="calc-monthly" class="input" value="200" min="0" step="50">
          </div>
          <div>
            <label class="label">${t('reports.annualRate')}</label>
            <input type="number" id="calc-rate" class="input" value="5" min="0" max="100" step="0.5">
          </div>
          <div>
            <label class="label">${t('reports.years')}</label>
            <input type="number" id="calc-years" class="input" value="10" min="1" max="50">
          </div>
        </div>
        <div id="calc-result" class="mt-4 grid grid-cols-3 gap-3">
          <!-- Filled by JS -->
        </div>
      </div>
      
      <!-- Currency Converter -->
      <div class="card">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
            <span class="text-white font-bold">💱</span>
          </div>
          <h3 class="font-bold text-lg text-dark-900 dark:text-white">${t('reports.currencyConverter')}</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label class="label">${t('common.amount')}</label>
            <input type="number" id="converter-amount" class="input" value="100" min="0" step="0.01">
          </div>
          <div>
            <label class="label">${t('reports.from')}</label>
            <select id="converter-from" class="input">
              <option value="EUR" selected>EUR - Euro</option>
              <option value="USD">USD - Dollar</option>
              <option value="GBP">GBP - Pound</option>
              <option value="MXN">MXN - Peso</option>
              <option value="BRL">BRL - Real</option>
            </select>
          </div>
          <div>
            <label class="label">${t('reports.to')}</label>
            <select id="converter-to" class="input">
              <option value="EUR">EUR - Euro</option>
              <option value="USD" selected>USD - Dollar</option>
              <option value="GBP">GBP - Pound</option>
              <option value="MXN">MXN - Peso</option>
              <option value="BRL">BRL - Real</option>
            </select>
          </div>
        </div>
        <div id="converter-result" class="mt-4 p-4 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 rounded-xl text-center">
          <p class="text-sm text-dark-500 dark:text-dark-400">${t('reports.result')}</p>
          <p class="text-2xl font-bold text-primary-600 dark:text-primary-400">$108.00 USD</p>
        </div>
      </div>

      <!-- Export Data -->
      <div class="card">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-indigo-500 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
          <div>
            <h3 class="font-bold text-lg text-dark-900 dark:text-white">${t('reports.exportData')}</h3>
            <p class="text-sm text-dark-500 dark:text-dark-400">${t('reports.exportDesc')}</p>
          </div>
        </div>
        <button id="btn-export-csv" class="btn-primary">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          ${t('reports.exportCSV')}
        </button>
      </div>
      
    </div>
  `
}

/**
 * Export transactions to CSV
 */
async function exportCSV() {
  try {
    const transacciones = await dataManager.obtenerTransacciones()
    if (!transacciones || transacciones.length === 0) {
      window.showToast?.('No data to export', 'warning')
      return
    }

    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount']
    const rows = transacciones.map(tx =>
      [
        tx.fecha || '',
        tx.tipo || '',
        tx.category?.nombre || tx.categoria || '',
        `"${(tx.descripcion || '').replace(/"/g, '""')}"`,
        tx.monto || 0
      ].join(',')
    )

    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `finanzapro_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    window.showToast?.(t('toast.exported'), 'success')
  } catch (error) {
    console.error('Export error:', error)
    window.showToast?.(t('toast.error'), 'error')
  }
}

/**
 * Inicializar eventos de Informes
 */
export function initInformesEvents() {
  // Currency converter
  const amountInput = document.getElementById('converter-amount')
  const fromSelect = document.getElementById('converter-from')
  const toSelect = document.getElementById('converter-to')
  const resultDiv = document.getElementById('converter-result')

  const updateConversion = () => {
    const amount = parseFloat(amountInput?.value) || 0
    const from = fromSelect?.value || 'EUR'
    const to = toSelect?.value || 'USD'
    const amountInEur = amount / exchangeRates[from]
    const result = amountInEur * exchangeRates[to]
    const rate = exchangeRates[to] / exchangeRates[from]
    const symbols = { EUR: '€', USD: '$', GBP: '£', MXN: '$', BRL: 'R$' }
    if (resultDiv) {
      resultDiv.innerHTML = `
                <p class="text-sm text-dark-500 dark:text-dark-400">${t('reports.result')}</p>
                <p class="text-2xl font-bold text-primary-600 dark:text-primary-400">${symbols[to]}${result.toFixed(2)} ${to}</p>
                <p class="text-xs text-dark-400 mt-1">1 ${from} = ${rate.toFixed(4)} ${to}</p>
            `
    }
  }

  amountInput?.addEventListener('input', updateConversion)
  fromSelect?.addEventListener('change', updateConversion)
  toSelect?.addEventListener('change', updateConversion)
  updateConversion()

  // Savings calculator
  const calcInputs = ['calc-initial', 'calc-monthly', 'calc-rate', 'calc-years']
  const resultContainer = document.getElementById('calc-result')

  const updateCalc = () => {
    const initial = parseFloat(document.getElementById('calc-initial')?.value) || 0
    const monthly = parseFloat(document.getElementById('calc-monthly')?.value) || 0
    const rate = parseFloat(document.getElementById('calc-rate')?.value) || 0
    const years = parseInt(document.getElementById('calc-years')?.value) || 1

    const monthlyRate = rate / 100 / 12
    const months = years * 12
    let futureValue = initial

    if (monthlyRate > 0) {
      futureValue = initial * Math.pow(1 + monthlyRate, months) + monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
    } else {
      futureValue = initial + monthly * months
    }

    const totalContributed = initial + monthly * months
    const totalInterest = futureValue - totalContributed

    if (resultContainer) {
      resultContainer.innerHTML = `
                <div class="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-center">
                    <p class="text-xs text-dark-500 dark:text-dark-400 mb-1">${t('reports.futureValue')}</p>
                    <p class="text-xl font-bold text-primary-600 dark:text-primary-400">${formatearMoneda(futureValue)}</p>
                </div>
                <div class="p-4 bg-dark-50 dark:bg-dark-800 rounded-xl text-center">
                    <p class="text-xs text-dark-500 dark:text-dark-400 mb-1">${t('reports.totalContributed')}</p>
                    <p class="text-xl font-bold text-dark-900 dark:text-white">${formatearMoneda(totalContributed)}</p>
                </div>
                <div class="p-4 bg-success-50 dark:bg-success-900/20 rounded-xl text-center">
                    <p class="text-xs text-dark-500 dark:text-dark-400 mb-1">${t('reports.totalInterest')}</p>
                    <p class="text-xl font-bold text-success-600 dark:text-success-400">${formatearMoneda(totalInterest)}</p>
                </div>
            `
    }
  }

  calcInputs.forEach(id => {
    document.getElementById(id)?.addEventListener('input', updateCalc)
  })
  updateCalc()

  // CSV export
  document.getElementById('btn-export-csv')?.addEventListener('click', exportCSV)
}

export default InformesView
