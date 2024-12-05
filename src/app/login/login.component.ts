import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: false
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  login(): void {
    const observer = {
      next: (response: any) => {
        if (response.success) {
          this.router.navigate(['/expenses']);
        }
      },
      error: (error: any) => {
        this.errorMessage = error.error.message || 'An error occurred';
      },
      complete: () => {
        console.log('Login request completed');
      }
    };

    this.authService.login(this.username, this.password).subscribe(observer);
  }
}
