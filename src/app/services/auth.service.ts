import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:5000';

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { username, password }).pipe(
        tap((response: any) => {
            if (response.success) {
                localStorage.setItem('token', response.token); 
                localStorage.setItem('userId', response.userId); 
                console.log('User logged in. Redirecting to expenses...');
                this.router.navigate(['/expenses']); 
            }
        })
    );
}

  signup(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { username, password });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getCurrentUser(): string | null {
    return localStorage.getItem('userId');
}

  checkLocalStorage(): void {
    const token = localStorage.getItem('token');
    const currentUser = localStorage.getItem('currentUser');
  
    if (!token && !currentUser) {
      console.log('No user logged in or localStorage is empty.');
    } else if (!token || !currentUser) {
      console.warn('User not logged in or missing data in localStorage.');
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
    }
  }
  
  
}
