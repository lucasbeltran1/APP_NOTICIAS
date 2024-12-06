import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { RouteReuseStrategy } from '@angular/router';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

// Importaciones de Firebase y AngularFire
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { AngularFireAuthModule } from '@angular/fire/compat/auth'; // Importa AngularFireAuth para autenticación
import { environment } from '../environments/environment'; // Archivo de configuración de Firebase

import { HttpClientModule } from '@angular/common/http';

// Importaciones para la configuración de fechas en español
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Limpia instancias previas de Firebase
const app = initializeApp(environment.firebaseConfig);
const auth = getAuth(app);

// Registrar el idioma español
registerLocaleData(localeEs);

@NgModule({
  declarations: [AppComponent], // Declaraciones de componentes
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig), // Inicializa Firebase
    AngularFirestoreModule, // Módulo de Firestore para manejo de datos
    AngularFireStorageModule, // Módulo de Storage para manejo de archivos
    AngularFireAuthModule, // Módulo de Authentication para Firebase
    HttpClientModule, // Configuración del módulo HTTP
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, // Estrategia de rutas
    { provide: LOCALE_ID, useValue: 'es' }, // Configuración del idioma a español
  ],
  bootstrap: [AppComponent], // Componente inicial
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Permite manejar elementos personalizados
})
export class AppModule {}
