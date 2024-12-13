import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:5000';

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { username, password }, { withCredentials: true }).pipe(
      tap((response: any) => {
        if (response.success) {
          console.log('User logged in successfully.');
          this.router.navigate(['/expenses']);
        }
      })
    );
  }
  

  signup(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { username, password }, { withCredentials: true });
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).subscribe(() => {
      console.log('User logged out.');
      this.router.navigate(['/welcome']);
    });
  }

isLoggedIn(): Observable<boolean> {
  return this.http.get<{ success: boolean }>(`${this.apiUrl}/check-auth`, { withCredentials: true }).pipe(
    map((response) => response.success) 
  );
}

getCurrentUser(): Observable<string | null> {
  return this.http
    .get<{ userId: string }>(`${this.apiUrl}/check-auth`, { withCredentials: true })
    .pipe(
      map(response => {
        if (response && response.userId) {
          return response.userId; 
        } else {
          console.warn('No user authenticated.');
          return null;
        }
      })
    );
}
  
  getProtectedData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/protected-route`, { withCredentials: true });
  }
}
