import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  standalone: true
})
export class SignupComponent {
  username = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  signup(): void {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.authService.signup(this.username, this.password).subscribe(
      (response) => {
        this.successMessage = 'Signup successful! Redirecting to login...';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      (error) => {
        this.errorMessage = error.error.message || 'An error occurred';
      }
    );
  }

  goBack(): void {
    this.router.navigate(['/welcome']);
  }
  
}
