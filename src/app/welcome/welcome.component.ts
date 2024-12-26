import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss',
  imports: [CommonModule],
  standalone: true
})
export class WelcomeComponent {
  constructor(private router: Router) {}

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToSignup(): void {
    this.router.navigate(['/signup']);
  }
}
