import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Configuración de Capacitor para FinanzaPro
 * 
 * Este archivo configura cómo se empaquetará la aplicación
 * como APK de Android.
 */
const config: CapacitorConfig = {
    // Identificador único de la aplicación (estilo Java package)
    // IMPORTANTE: Cambiar por tu propio dominio inverso
    appId: 'com.finanzapro.app',

    // Nombre que aparecerá en el dispositivo
    appName: 'FinanzaPro',

    // Carpeta donde está el build de producción
    webDir: 'dist',

    // Configuración del servidor
    server: {
        // En desarrollo, puedes usar una URL local para hot reload
        // url: 'http://192.168.1.X:5173',
        // cleartext: true,

        // Permitir navegación a dominios externos (para Supabase)
        allowNavigation: [
            'supabase.co',
            '*.supabase.co'
        ]
    },

    // Configuración específica de Android
    android: {
        // Color de la barra de estado
        backgroundColor: '#6366f1',

        // Permitir contenido mixto (HTTP y HTTPS)
        allowMixedContent: true
    },

    // Plugins
    plugins: {
        // Configuración de SplashScreen
        SplashScreen: {
            launchShowDuration: 2000,
            backgroundColor: '#6366f1',
            showSpinner: true,
            spinnerColor: '#ffffff'
        }
    }
};

export default config;
