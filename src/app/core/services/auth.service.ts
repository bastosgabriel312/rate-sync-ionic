import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  user,
  User,
  signInWithPopup,
  onAuthStateChanged
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';

import { Observable, from, BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user$: Observable<User | null>;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  private userPhotoSubject = new BehaviorSubject<string | null>(null);
  userPhoto$ = this.userPhotoSubject.asObservable();

  private displayNameSubject = new BehaviorSubject<string | null>(null);
  displayName$ = this.displayNameSubject.asObservable();

  constructor(private auth: Auth, private router: Router) {
    // Configura persistência local antes de observar o estado do usuário
    setPersistence(this.auth, browserLocalPersistence)
      .then(() => {
        onAuthStateChanged(this.auth, (user) => {
          this.currentUserSubject.next(user);
          this.userPhotoSubject.next(user?.photoURL || null);
          this.displayNameSubject.next(user?.displayName || null);

          if (user) {
            // Redireciona para home se estiver logado
            this.router.navigate(['/home']);
          } else {
            // Redireciona para login se não estiver logado
            this.router.navigate(['/login']);
          }
        });
      })
      .catch(error => console.error('Erro ao setar persistência:', error));

    this.user$ = user(this.auth);
  }

  // Login com email/senha
  loginWithEmail(email: string, password: string): Observable<any> {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  // Cadastro com email/senha
  registerWithEmail(email: string, password: string): Observable<any> {
    return from(createUserWithEmailAndPassword(this.auth, email, password));
  }

  // Login com Google
  loginWithGoogle(): Observable<any> {
    const provider = new GoogleAuthProvider();
    return from(signInWithPopup(this.auth, provider));
  }

  // Logout
  logout(): Observable<void> {
    return from(signOut(this.auth));
  }

  // Pega token do usuário logado
  async getIdToken(): Promise<string | null> {
    return new Promise((resolve, reject) => {
      // Observa o estado do usuário
      onAuthStateChanged(this.auth, async (user) => {
        if (user) {
          try {
            const token = await user.getIdToken();
            resolve(token);
          } catch (error) {
            console.error('Erro ao pegar token:', error);
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });
    });
  }

  // Estado de autenticação
  isAuthenticated(): boolean {
    return !!this.auth.currentUser;
  }

  // Dados do usuário
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  getUserPhoto(): string | null {
    return this.auth.currentUser?.photoURL || null;
  }

  getDisplayName(): string | null {
    return this.auth.currentUser?.displayName || null;
  }
  getUserEmail(): string | null {
    return this.auth.currentUser?.email || null;
  }

  getUserId(): string | null {
    return this.auth.currentUser?.uid || null;
  }

}