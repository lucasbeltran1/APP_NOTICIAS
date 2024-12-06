import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  // Redirigir a 'login2' por defecto si no hay una ruta específica
  {
    path: '',
    redirectTo: 'login2',
    pathMatch: 'full'
  },
  // Ruta para la página principal protegida
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule),
    canActivate: [AuthGuard] // Ruta protegida
  },
  // Segunda página principal protegida
  {
    path: 'segundo-home',
    loadChildren: () => import('./segundo-home/segundo-home.module').then(m => m.SegundoHomePageModule),
    canActivate: [AuthGuard] // Ruta protegida
  },
  // Página protegida 'home3'
  {
    path: 'home3',
    loadChildren: () => import('./home3/home3.module').then(m => m.Home3PageModule),
    canActivate: [AuthGuard] // Ruta protegida
  },
  // Página protegida 'home4'
  {
    path: 'home4',
    loadChildren: () => import('./home4/home4.module').then(m => m.Home4PageModule),
    canActivate: [AuthGuard] // Ruta protegida
  },
  // Página protegida 'animation'
  {
    path: 'animation',
    loadChildren: () => import('./animation/animation.module').then(m => m.AnimationPageModule),
    canActivate: [AuthGuard] // Ruta protegida
  },
  // Página protegida 'ionic-storage-module'
  {
    path: 'ionic-storage-module',
    loadChildren: () => import('./ionic-storage-module/ionic-storage-module.module').then(m => m.IonicStorageModulePageModule),
    canActivate: [AuthGuard] // Ruta protegida
  },
  // Páginas públicas

  {
    path: 'login2',
    loadChildren: () => import('./login2/login2.module').then(m => m.Login2PageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./register/register.module').then(m => m.RegisterPageModule)
  },
  {
    path: 'forgot-password',
    loadChildren: () => import('./forgot-password/forgot-password.module').then(m => m.ForgotPasswordPageModule)
  },
  {
    path: 'noticias',
    loadChildren: () => import('./noticias/noticias.module').then(m => m.NoticiasPageModule)
  },
  {
    path: 'deportes',
    loadChildren: () => import('./deportes/deportes.module').then(m => m.DeportesPageModule)
  },
  {
    path: 'cine',
    loadChildren: () => import('./cine/cine.module').then(m => m.CinePageModule)
  },
  {
    path: 'internacional',
    loadChildren: () => import('./internacional/internacional.module').then(m => m.InternacionalPageModule)
  },
  {
    path: 'data',
    loadChildren: () => import('./data/data.module').then(m => m.DataPageModule)
  },
  // Página de error o redirección para rutas no encontradas
  {
    path: '**',
    redirectTo: 'login2', // Redirigir al login2 por defecto si la ruta no existe
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
