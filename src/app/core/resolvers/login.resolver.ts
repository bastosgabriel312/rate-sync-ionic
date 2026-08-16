import { Injectable } from '@angular/core';
import { Resolve, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoginResolver implements Resolve<any> {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  resolve(): Observable<any> {
    const isLoggedIn = this.authService.isAuthenticated();
    if (isLoggedIn) {
      this.router.navigate(['/home']);
      return of({ isLoggedIn: true });
    }

    return of({ isLoggedIn: false });
  }
}
