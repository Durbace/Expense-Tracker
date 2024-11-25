import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loggedInUser: string | null = null;   

  login(username: string, password: string): boolean {
    const validUsers = [
      { username: 'user1', password: 'password1' },
      { username: 'user2', password: 'password2' },
    ];
    const user = validUsers.find(
      (u) => u.username === username && u.password === password
    );
    if (user) {
      this.loggedInUser = username;
      localStorage.setItem('loggedInUser', username);
      return true;
    }
    return false;
  }

  logout(): void {
    this.loggedInUser = null;
    localStorage.removeItem('loggedInUser');
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('loggedInUser') !== null;
  }

  checkLocalStorage(): void {
    this.loggedInUser = localStorage.getItem('loggedInUser');
  }

  getCurrentUser(): string | null {
    return localStorage.getItem('loggedInUser');
  }
      
}
