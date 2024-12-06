import { Component } from '@angular/core'; // Importa la clase base para componentes en Angular
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // Importa herramientas para construir formularios reactivos
import { AngularFireStorage } from '@angular/fire/compat/storage'; // Importa servicio para almacenamiento en Firebase
import { AngularFirestore } from '@angular/fire/compat/firestore'; // Importa servicio para operaciones con Firestore
import { ToastController, AlertController } from '@ionic/angular'; // Importa servicios de UI de Ionic para notificaciones y alertas
import { Router } from '@angular/router'; // Importa servicio para navegación entre páginas

@Component({
  selector: 'app-ionic-storage-module', // Selector para identificar el componente en las plantillas HTML
  templateUrl: './ionic-storage-module.page.html', // Ruta al archivo de plantilla HTML
  styleUrls: ['./ionic-storage-module.page.scss'], // Rutas a los estilos CSS específicos del componente
})
export class IonicStorageModulePage {
  dataForm: FormGroup; // Formulario reactivo para manejar datos del usuario
  storedData: any[] = []; // Almacena datos recuperados de Firestore
  uploadProgress: number | null = null; // Indica el progreso de una carga de archivo
  isEditMode: boolean = false; // Define si el formulario está en modo edición
  editDocId: string | null = null; // Identifica el documento en edición
  selectedUser: any | null = null; // Usuario seleccionado para edición o acciones

  constructor(
    private formBuilder: FormBuilder, // Servicio para construir formularios
    private firestore: AngularFirestore, // Servicio para interactuar con Firestore
    private storage: AngularFireStorage, // Servicio para manejar almacenamiento en Firebase
    private toastController: ToastController, // Servicio para mostrar mensajes emergentes
    private alertController: AlertController, // Servicio para mostrar alertas
    private router: Router // Servicio para manejar navegación entre rutas
  ) {
    // Inicializa el formulario con campos requeridos y validaciones
    this.dataForm = this.formBuilder.group({
      name: ['', Validators.required], // Campo obligatorio para el nombre
      phone: ['', Validators.required], // Campo obligatorio para el teléfono
      rut: ['', [Validators.required]], // Campo obligatorio para el RUT
      age: ['', Validators.required], // Campo obligatorio para la edad
      sexo: ['', Validators.required], // Campo obligatorio para el sexo
    });
  }

  // Navega al home de la aplicación
  goHome() {
    this.router.navigate(['/home']); // Usa el router para redirigir al home
  }

  // Selecciona un usuario desde la lista para acciones
  onSelectUser(data: any) {
    // Deselecciona todos los usuarios excepto el actual
    this.storedData.forEach(user => {
      if (user.id !== data.id) {
        user.isSelected = false; // Deselecciona el usuario
        user.isEditing = false; // Desactiva modo edición
      }
    });
    // Guarda el usuario seleccionado o lo deselecciona
    this.selectedUser = data.isSelected ? data : null;
  }

  // Activa el modo de edición para el usuario seleccionado
  editRow() {
    if (!this.selectedUser) {
      // Muestra un mensaje de error si no hay usuario seleccionado
      this.showErrorMessage('Debes seleccionar un usuario para modificar.');
      return;
    }
    this.selectedUser.isEditing = true; // Activa modo edición para el usuario
  }

  // Guarda los cambios realizados en el usuario seleccionado
  async saveRowData() {
    if (!this.selectedUser) {
      // Muestra un mensaje si no hay usuario seleccionado
      this.showErrorMessage('Debes seleccionar un usuario para guardar los cambios.');
      return;
    }

    try {
      // Actualiza los datos del usuario en Firestore
      await this.firestore.collection('userData').doc(this.selectedUser.id).update({
        name: this.selectedUser.name,
        age: this.selectedUser.age,
        sexo: this.selectedUser.sexo,
        phone: this.selectedUser.phone
      });
      this.selectedUser.isEditing = false; // Sal del modo de edición
      this.showSuccessMessage('Datos actualizados correctamente.');
    } catch (error) {
      this.handleError(error, 'Error al actualizar los datos.');
    }
  }

  // Guarda nuevos datos o actualiza datos existentes
  async saveData() {
    if (this.dataForm.valid) {
      const formData = this.dataForm.value; // Recupera datos del formulario

      try {
        if (this.isEditMode && this.editDocId) {
          // Si está en modo edición, actualiza el documento
          await this.firestore.collection('userData').doc(this.editDocId).update(formData);
          this.showSuccessMessage('Datos actualizados correctamente.');
        } else {
          // Verifica que no haya duplicados de RUT en Firestore
          const rutExists = await this.firestore.collection('userData', ref => ref.where('rut', '==', formData.rut)).get().toPromise();
          if (!rutExists?.empty) {
            this.showErrorMessage('El RUT ya existe. No se pueden duplicar RUTs.');
            return;
          }
          // Agrega un nuevo documento a Firestore
          const docRef = await this.firestore.collection('userData').add(formData);
          this.editDocId = docRef.id; // Guarda el ID del documento
          this.showSuccessMessage('Datos guardados correctamente.');
        }

        this.dataForm.reset(); // Reinicia el formulario
        this.isEditMode = false;
        this.editDocId = null;
        this.showStoredData(); // Refresca los datos mostrados
      } catch (error) {
        this.handleError(error, 'Error al guardar los datos.');
      }
    }
  }

  // Recupera y muestra datos de Firestore
  async showStoredData() {
    try {
      const snapshot = await this.firestore.collection('userData').get().toPromise();
      this.storedData = snapshot?.docs.map(doc => {
        const data = doc.data() as { [key: string]: any };
        return { id: doc.id, ...data, isSelected: false, isEditing: false }; // Agrega propiedades adicionales
      }) || [];
    } catch (error) {
      this.handleError(error, 'Error al recuperar los datos.');
    }
  }

  // Sube una imagen a Firebase Storage y guarda la URL en Firestore
  async uploadImage(event: any, docId: string) {
    const file = event.target.files[0]; // Obtiene el archivo del input
    if (!file) {
      this.showErrorMessage('No se seleccionó ningún archivo.');
      return;
    }

    const filePath = `images/${new Date().getTime()}_${file.name}`; // Define la ruta del archivo
    const fileRef = this.storage.ref(filePath);

    try {
      const task = this.storage.upload(filePath, file); // Sube el archivo

      // Monitorea el progreso de subida
      task.percentageChanges().subscribe((progress) => {
        this.uploadProgress = progress || 0;
        console.log(`Progreso de subida: ${this.uploadProgress}%`);
      });

      await task.snapshotChanges().toPromise(); // Espera a que termine la subida

      const imageUrl = await fileRef.getDownloadURL().toPromise(); // Obtiene la URL del archivo

      // Actualiza Firestore con la URL de la imagen
      await this.firestore.collection('userData').doc(docId).update({ imageUrl });

      this.showSuccessMessage('Imagen subida correctamente.');
    } catch (error) {
      this.handleError(error, 'Error al subir la imagen.');
    }
  }

  // Descarga un archivo desde Firebase Storage
  async downloadFile(fileUrl: string) {
    try {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = 'file'; // Nombre por defecto del archivo descargado
      link.click();
    } catch (error) {
      this.handleError(error, 'Error al descargar el archivo.');
    }
  }

  // Muestra una alerta de confirmación para eliminar un registro
  async confirmDelete(rut: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación', // Título de la alerta
      message: '¿Estás seguro que deseas eliminar este registro?', // Mensaje de la alerta
      buttons: [
        {
          text: 'Cancelar', // Botón para cancelar
          role: 'cancel',
        },
        {
          text: 'Eliminar', // Botón para confirmar eliminación
          handler: () => {
            this.deleteByRut(rut); // Llama al método de eliminación
          }
        }
      ]
    });

    await alert.present(); // Muestra la alerta
  }

  // Elimina un documento de Firestore basado en el RUT
  async deleteByRut(rut: string) {
    try {
      const snapshot = await this.firestore.collection('userData', ref => ref.where('rut', '==', rut)).get().toPromise();
      if (snapshot && !snapshot.empty) {
        // Elimina cada documento coincidente
        snapshot.forEach(async (doc) => {
          await this.firestore.collection('userData').doc(doc.id).delete();
        });
        this.showSuccessMessage(`Registro con RUT ${rut} eliminado correctamente.`);
        this.showStoredData(); // Refresca los datos mostrados
      } else {
        this.showErrorMessage(`No se encontró el registro con RUT ${rut}.`);
      }
    } catch (error) {
      this.handleError(error, 'Error al eliminar el registro.');
    }
  }

  // Maneja y muestra errores
  private handleError(error: any, defaultMessage: string) {
    let errorMessage = defaultMessage;
    if (error instanceof Error) {
      errorMessage = `${defaultMessage} ${error.message}`;
    }
    this.showErrorMessage(errorMessage); // Muestra mensaje de error
  }

  // Muestra mensajes de éxito en pantalla
  async showSuccessMessage(message: string) {
    const toast = await this.toastController.create({
      message, // Mensaje de éxito
      duration: 2000, // Duración del mensaje
      color: 'success', // Color del mensaje
    });
    await toast.present();
  }

  // Muestra mensajes de error en pantalla
  async showErrorMessage(message: string) {
    const toast = await this.toastController.create({
      message, // Mensaje de error
      duration: 2000, // Duración del mensaje
      color: 'danger', // Color del mensaje
    });
    await toast.present();
  }
}
