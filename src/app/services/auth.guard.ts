import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { AuthService } from './auth.service';
import { catchError, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.authService.isLoggedIn().pipe(
      map((isLoggedIn: boolean) => {
        if (isLoggedIn) {
          return true;
        } else {
          this.router.navigate(['/login']);
          return false;
        }
      }),
      catchError((error) => {
        console.error('Error during auth guard check:', error);
        this.router.navigate(['/login']);
        return [false];
      })
    );
  }
}
