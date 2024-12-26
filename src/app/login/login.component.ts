import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AuthService } from '../services/auth.service';



@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  standalone: true
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

  goBack(): void {
    this.router.navigate(['/welcome']);
  }
  
}
