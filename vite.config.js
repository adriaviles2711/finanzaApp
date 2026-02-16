import { defineConfig } from 'vite'

/**
 * Configuración de Vite para FinanzaPro
 * 
 * IMPORTANTE: `base: './'` es CRUCIAL para que la aplicación funcione
 * correctamente cuando se empaqueta con Capacitor para Android.
 * 
 * ¿Por qué?
 * - Capacitor sirve los archivos desde el sistema de archivos local (file://)
 * - Sin esta configuración, las rutas serían absolutas (/assets/...)
 * - Las rutas absolutas no funcionan en file://, causando errores 404
 * - Con `base: './'`, las rutas son relativas (./assets/...) y funcionan correctamente
 */
export default defineConfig({
    // Usar rutas relativas para compatibilidad con Capacitor/Android
    base: './',

    // Configuración del servidor de desarrollo
    server: {
        port: 5173,
        open: true // Abrir el navegador automáticamente
    },

    // Configuración de build para producción
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        // Generar sourcemaps para debugging
        sourcemap: true,
        // Optimizaciones para producción
        minify: 'esbuild'
    }
})
