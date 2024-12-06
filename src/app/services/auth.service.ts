import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { GoogleAuthProvider, User } from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore
  ) {}

  // Método para registrar usuarios y guardar datos adicionales en Firestore
  async register(email: string, password: string, additionalData: { name: string }): Promise<void> {
    try {
      const result = await this.afAuth.createUserWithEmailAndPassword(email, password);
      if (result.user) {
        await this.firestore.collection('users').doc(result.user.uid).set({
          email,
          ...additionalData,
        });
        console.log('Usuario registrado con éxito:', result.user);
      }
    } catch (error: any) {
      console.error('Error durante el registro:', error.message || error);
      throw new Error(error.message || 'Error durante el registro');
    }
  }

  // Método para iniciar sesión con correo y contraseña
  async login(email: string, password: string): Promise<void> {
    try {
      await this.afAuth.signInWithEmailAndPassword(email, password);
      console.log('Inicio de sesión exitoso con correo y contraseña');
    } catch (error: any) {
      console.error('Error durante el login:', error.message || error);
      throw new Error(error.message || 'Error durante el inicio de sesión');
    }
  }

  // Método para iniciar sesión con Google
  async loginWithGoogle(): Promise<void> {
    try {
      const provider = new GoogleAuthProvider();
      const result = await this.afAuth.signInWithPopup(provider);

      if (result.user) {
        const userData = {
          uid: result.user.uid,
          displayName: result.user.displayName || 'Usuario',
          email: result.user.email,
          photoURL: result.user.photoURL || null,
        };
        await this.firestore.collection('users').doc(result.user.uid).set(userData, { merge: true });
        console.log('Inicio de sesión con Google exitoso:', result.user);
      }
    } catch (error: any) {
      console.error('Error durante el login con Google:', error.message || error);
      throw new Error(error.message || 'Error durante el inicio de sesión con Google');
    }
  }

  // Método para cerrar sesión
  async logout(): Promise<void> {
    try {
      await this.afAuth.signOut();
      console.log('Sesión cerrada con éxito');
    } catch (error: any) {
      console.error('Error durante el logout:', error.message || error);
      throw new Error(error.message || 'Error al cerrar sesión');
    }
  }

  // Verificar si un usuario está autenticado
  isLoggedIn(): boolean {
    return !!this.afAuth.currentUser;
  }

  // Obtener el usuario actual autenticado
  async getCurrentUser(): Promise<User | null> {
    try {
      return (await this.afAuth.currentUser) as User | null;
    } catch (error: any) {
      console.error('Error al obtener el usuario actual:', error.message || error);
      throw new Error(error.message || 'Error al obtener el usuario actual');
    }
  }

  // Observable del estado de autenticación
  getAuthState(): Observable<User | null> {
    return this.afAuth.authState as Observable<User | null>;
  }

  // Método para restablecer contraseña
  async resetPassword(email: string): Promise<void> {
    try {
      await this.afAuth.sendPasswordResetEmail(email);
      console.log(`Correo de restablecimiento enviado a: ${email}`);
    } catch (error: any) {
      console.error('Error durante el restablecimiento de contraseña:', error.message || error);
      throw new Error(error.message || 'Error al restablecer contraseña');
    }
  }

  // Eliminar un usuario autenticado
  async deleteUser(): Promise<void> {
    try {
      const user = await this.afAuth.currentUser;
      if (user) {
        await user.delete();
        console.log('Usuario eliminado correctamente');
      } else {
        throw new Error('No hay un usuario autenticado para eliminar');
      }
    } catch (error: any) {
      console.error('Error al eliminar el usuario:', error.message || error);
      throw new Error(error.message || 'Error al eliminar usuario');
    }
  }

  // Actualizar el perfil del usuario
  async updateUserProfile(displayName: string, photoURL: string): Promise<void> {
    try {
      const user = await this.afAuth.currentUser;
      if (user) {
        await user.updateProfile({
          displayName,
          photoURL,
        });
        console.log('Perfil actualizado correctamente');
      } else {
        throw new Error('No hay un usuario autenticado para actualizar');
      }
    } catch (error: any) {
      console.error('Error al actualizar el perfil del usuario:', error.message || error);
      throw new Error(error.message || 'Error al actualizar perfil');
    }
  }
}
