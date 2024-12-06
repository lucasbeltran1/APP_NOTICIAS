import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Importamos el servicio de autenticación

@Component({
  selector: 'app-login2',
  templateUrl: './login2.page.html',
  styleUrls: ['./login2.page.scss'],
})
export class Login2Page {
  loginForm: FormGroup; // El formulario reactivo para login
  isLoading = false; // Indicador de carga para mostrar feedback al usuario

  constructor(
    private formBuilder: FormBuilder,
    private toastController: ToastController,
    private alertController: AlertController,
    private router: Router,
    private authService: AuthService // Servicio de autenticación
  ) {
    // Inicializamos el formulario con validaciones
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]], // Validar que el email sea requerido y válido
      password: ['', Validators.required], // Validar que la contraseña sea requerida
    });
  }

  // Método que se llama cuando el usuario intenta iniciar sesión
  async onLogin() {
    if (this.loginForm.invalid) {
      await this.presentToast('Por favor, complete el formulario correctamente.', 'danger');
      return;
    }

    this.isLoading = true; // Comienza la carga

    try {
      const { email, password } = this.loginForm.value; // Extraer valores del formulario
      await this.authService.login(email, password);
      await this.presentToast(`Bienvenido, ${email}!`, 'success');
      this.router.navigate(['/home']); // Redirige al usuario autenticado
    } catch (error: any) {
      await this.presentToast(error?.message || 'Hubo un error al intentar iniciar sesión.', 'danger');
    } finally {
      this.isLoading = false; // Finaliza la carga
    }
  }

  // Método para iniciar sesión con Google
  async loginWithGoogle() {
    try {
      this.isLoading = true; // Comienza la carga
      await this.authService.loginWithGoogle();
      await this.presentToast('Inicio de sesión con Google exitoso.', 'success');
      this.router.navigate(['/home']); // Redirige al usuario autenticado
    } catch (error: any) {
      await this.presentToast(error?.message || 'Hubo un error al iniciar sesión con Google.', 'danger');
    } finally {
      this.isLoading = false; // Finaliza la carga
    }
  }

  // Método para cerrar sesión
  async logout() {
    try {
      await this.authService.logout();
      await this.presentToast('Sesión cerrada con éxito.', 'warning');
      this.router.navigate(['/login2']); // Redirige al login después de cerrar sesión
      this.loginForm.reset(); // Limpia el formulario
    } catch (error: any) {
      await this.presentToast(error?.message || 'Hubo un error al cerrar sesión.', 'danger');
    }
  }

  // Método para restablecer contraseña
  async onForgotPassword() {
    const alert = await this.alertController.create({
      header: 'Restablecer contraseña',
      message: 'Introduce tu correo electrónico para enviar un enlace de recuperación.',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'Correo electrónico',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Enviar',
          handler: async (data) => {
            if (data.email) {
              try {
                await this.authService.resetPassword(data.email);
                await this.presentToast(
                  `Correo enviado a ${data.email}. Revisa tu bandeja de entrada.`,
                  'success'
                );
              } catch (error: any) {
                await this.presentToast(
                  error?.message || 'Error al enviar el correo de restablecimiento.',
                  'danger'
                );
              }
            } else {
              await this.presentToast('Por favor, ingresa un correo válido.', 'danger');
            }
          },
        },
      ],
    });

    await alert.present();
  }

  // Método para mostrar un toast reutilizable
  private async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
    });
    await toast.present();
  }
}
