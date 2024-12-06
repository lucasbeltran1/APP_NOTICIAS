import { Component } from '@angular/core'; // Importa la clase base para crear componentes de Angular
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // Importa herramientas para manejar formularios reactivos
import { ToastController, AlertController } from '@ionic/angular'; // Importa servicios para notificaciones y alertas de Ionic
import { Router } from '@angular/router'; // Servicio para la navegación entre rutas
import { AuthService } from '../services/auth.service'; // Importa el servicio de autenticación personalizado

@Component({
  selector: 'app-login2', // Selector del componente para usarlo en plantillas HTML
  templateUrl: './login2.page.html', // Ruta al archivo de plantilla HTML de este componente
  styleUrls: ['./login2.page.scss'], // Ruta al archivo de estilos CSS de este componente
})
export class Login2Page {
  loginForm: FormGroup; // Define el formulario reactivo para login
  isLoading = false; // Variable para indicar si hay una operación en curso (carga)

  constructor(
    private formBuilder: FormBuilder, // Servicio para crear y manejar formularios reactivos
    private toastController: ToastController, // Servicio para mostrar notificaciones (toasts)
    private alertController: AlertController, // Servicio para mostrar alertas al usuario
    private router: Router, // Servicio para manejar la navegación entre páginas
    private authService: AuthService // Servicio para manejar autenticación (login, logout, etc.)
  ) {
    // Inicializa el formulario con campos y validaciones
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]], // Campo obligatorio y formato de email válido
      password: ['', Validators.required], // Campo obligatorio para la contraseña
    });
  }

  // Método que se ejecuta cuando el usuario intenta iniciar sesión
  async onLogin() {
    // Verifica si el formulario es inválido
    if (this.loginForm.invalid) {
      // Muestra un mensaje de error
      await this.presentToast('Por favor, complete el formulario correctamente.', 'danger');
      return; // Detiene la ejecución si el formulario es inválido
    }

    this.isLoading = true; // Activa el indicador de carga

    try {
      const { email, password } = this.loginForm.value; // Extrae los valores del formulario
      await this.authService.login(email, password); // Llama al método de login del servicio de autenticación
      await this.presentToast(`Bienvenido, ${email}!`, 'success'); // Muestra un mensaje de bienvenida
      this.router.navigate(['/home']); // Redirige al usuario a la página principal
    } catch (error: any) {
      // Maneja errores y muestra un mensaje al usuario
      await this.presentToast(error?.message || 'Hubo un error al intentar iniciar sesión.', 'danger');
    } finally {
      this.isLoading = false; // Desactiva el indicador de carga
    }
  }

  // Método para iniciar sesión con Google
  async loginWithGoogle() {
    try {
      this.isLoading = true; // Activa el indicador de carga
      await this.authService.loginWithGoogle(); // Llama al método de login con Google
      await this.presentToast('Inicio de sesión con Google exitoso.', 'success'); // Mensaje de éxito
      this.router.navigate(['/home']); // Redirige al usuario a la página principal
    } catch (error: any) {
      // Maneja errores y muestra un mensaje al usuario
      await this.presentToast(error?.message || 'Hubo un error al iniciar sesión con Google.', 'danger');
    } finally {
      this.isLoading = false; // Desactiva el indicador de carga
    }
  }

  // Método para cerrar la sesión del usuario
  async logout() {
    try {
      await this.authService.logout(); // Llama al método de logout del servicio de autenticación
      await this.presentToast('Sesión cerrada con éxito.', 'warning'); // Mensaje de éxito al cerrar sesión
      this.router.navigate(['/login2']); // Redirige al usuario a la página de login
      this.loginForm.reset(); // Limpia el formulario de login
    } catch (error: any) {
      // Maneja errores y muestra un mensaje al usuario
      await this.presentToast(error?.message || 'Hubo un error al cerrar sesión.', 'danger');
    }
  }

  // Método para restablecer la contraseña del usuario
  async onForgotPassword() {
    // Muestra un cuadro de diálogo para que el usuario ingrese su correo
    const alert = await this.alertController.create({
      header: 'Restablecer contraseña', // Título de la alerta
      message: 'Introduce tu correo electrónico para enviar un enlace de recuperación.', // Instrucciones
      inputs: [
        {
          name: 'email', // Nombre del campo
          type: 'email', // Tipo de entrada (correo electrónico)
          placeholder: 'Correo electrónico', // Placeholder para el input
        },
      ],
      buttons: [
        {
          text: 'Cancelar', // Botón para cancelar
          role: 'cancel',
        },
        {
          text: 'Enviar', // Botón para confirmar
          handler: async (data) => {
            if (data.email) {
              try {
                // Llama al método de restablecimiento de contraseña del servicio de autenticación
                await this.authService.resetPassword(data.email);
                await this.presentToast(
                  `Correo enviado a ${data.email}. Revisa tu bandeja de entrada.`,
                  'success'
                ); // Mensaje de éxito
              } catch (error: any) {
                // Maneja errores y muestra un mensaje al usuario
                await this.presentToast(
                  error?.message || 'Error al enviar el correo de restablecimiento.',
                  'danger'
                );
              }
            } else {
              // Muestra un mensaje si el correo no es válido
              await this.presentToast('Por favor, ingresa un correo válido.', 'danger');
            }
          },
        },
      ],
    });

    await alert.present(); // Muestra la alerta al usuario
  }

  // Método reutilizable para mostrar notificaciones (toasts)
  private async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message, // Mensaje que se mostrará
      duration: 2000, // Duración en milisegundos
      color, // Color del toast (success, danger, etc.)
    });
    await toast.present(); // Muestra el toast
  }
}
