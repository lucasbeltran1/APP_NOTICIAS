import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  // Método que determina si se puede activar una ruta
  canActivate(): Observable<boolean> {
    return this.authService.getAuthState().pipe(
      take(1), // Solo toma el primer valor emitido por el observable
      map((user) => {
        if (!!user) {
          // Si el usuario está autenticado
          return true; // Permitir acceso
        } else {
          // Si no hay un usuario autenticado
          this.router.navigate(['/login']); // Redirigir al login
          return false; // Bloquear acceso
        }
      })
    );
  }
}
