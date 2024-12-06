import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter', // Identificador único de la aplicación
  appName: 'Desarrollo_movil', // Nombre visible de la aplicación
  webDir: 'www', // Carpeta que contiene los archivos web compilados
  bundledWebRuntime: false, // Deshabilita la inclusión del runtime de Capacitor en la web

  // Configuración específica para plugins
  plugins: {
    Geolocation: {
      androidPermission: 'ACCESS_FINE_LOCATION', // Permiso para obtener ubicación precisa en Android
    },
    SplashScreen: {
      launchShowDuration: 3000, // Duración de la pantalla de inicio
      backgroundColor: '#ffffff', // Color de fondo
      androidSplashResourceName: 'splash', // Recurso para la pantalla de inicio en Android
      iosSplashResourceName: 'Default', // Recurso para la pantalla de inicio en iOS
      showSpinner: true, // Mostrar el spinner de carga
      spinnerColor: '#999999', // Color del spinner
    },
    FirebaseAuthentication: {
      skipNativeAuth: false, // Utiliza autenticación nativa
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'], // Opciones de notificación en primer plano
    },
  },

  // Configuración para plataformas específicas
  android: {
    allowMixedContent: true, // Permite contenido mixto (por ejemplo, HTTP y HTTPS)
    webContentsDebuggingEnabled: true, // Habilita la depuración de contenidos web
  },
  ios: {
    contentInset: 'always', // Ajuste de contenido en iOS
  },
};

export default config;
