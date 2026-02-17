/**
 * =====================================================
 * FINANZAPRO - User Preferences
 * =====================================================
 * Manage user preferences like navigation order, etc.
 */

const STORAGE_KEYS = {
    NAV_ITEMS: 'finanza_nav_items'
}

export const AVAILABLE_NAV_ITEMS = [
    { id: 'dashboard', iconPath: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'transacciones', iconPath: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { id: 'presupuestos', iconPath: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { id: 'categorias', iconPath: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
    { id: 'metas', iconPath: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { id: 'informes', iconPath: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'perfil', iconPath: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }
]

const DEFAULT_NAV = ['dashboard', 'transacciones', 'presupuestos']

export function getNavItems() {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.NAV_ITEMS)
        const items = stored ? JSON.parse(stored) : DEFAULT_NAV

        // Ensure we always have exactly 3 items and they are valid
        // If stored data is corrupted, fallback to default
        if (!Array.isArray(items) || items.length !== 3) {
            return DEFAULT_NAV
        }

        // Ensure all items exist in AVAILABLE_NAV_ITEMS
        const validIds = AVAILABLE_NAV_ITEMS.map(i => i.id)
        const allValid = items.every(id => validIds.includes(id))

        return allValid ? items : DEFAULT_NAV
    } catch (e) {
        return DEFAULT_NAV
    }
}

export function saveNavItems(items) {
    if (!Array.isArray(items) || items.length !== 3) {
        console.error('Must provide exactly 3 navigation items')
        return false
    }
    localStorage.setItem(STORAGE_KEYS.NAV_ITEMS, JSON.stringify(items))
    return true
}

export function getAvailableNavItems() {
    return AVAILABLE_NAV_ITEMS
}
