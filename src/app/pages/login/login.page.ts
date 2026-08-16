import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  email = '';
  password = '';
  showRegister = false;
  error = '';
  isLoading = false;

  constructor(private authService: AuthService,
    private router: Router, private toastService: ToastService) { }

  loginWithEmail() {
    this.error = '';
    this.isLoading = true;
    this.authService.loginWithEmail(this.email, this.password).subscribe({

      next: () => {
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.toastService.showErrorToast(this.getErrorMessage(err.code));
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  register() {
    this.error = '';
    this.isLoading = true;
    this.authService.registerWithEmail(this.email, this.password).subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.toastService.showErrorToast(this.getErrorMessage(err.code));
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  loginWithGoogle() {
    this.error = '';
    this.authService.loginWithGoogle().subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.error = this.getErrorMessage(err.code);
      }
    });
  }

  private getErrorMessage(code: string): string {
    const errors: { [key: string]: string } = {
      'auth/user-not-found': 'Usuário não encontrado',
      'auth/wrong-password': 'Senha incorreta',
      'auth/email-already-in-use': 'Email já está em uso',
      'auth/weak-password': 'Senha muito fraca (mínimo 6 caracteres)',
      'auth/invalid-email': 'Usuário ou senha inválidos',
      'auth/popup-closed-by-user': 'Login cancelado',
      'auth/invalid-credential': 'Usuário ou senha inválidos'
    };
    return errors[code] || 'Erro ao autenticar';
  }
}
