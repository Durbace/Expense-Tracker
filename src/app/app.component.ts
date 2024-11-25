import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { BudgetService } from './services/budget.service';
import { AuthService } from './services/auth.service';
import { ExpenseService } from './services/expense.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    standalone: false
})
export class AppComponent implements OnInit{
  selectedDay: string | null = null;
  showDaily: boolean = true;
  showSummary: boolean = false;
  isLoggedIn = false;

  constructor(
    public authService: AuthService,
    private budgetService: BudgetService, 
    private expenseService: ExpenseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.checkLocalStorage();
    this.isLoggedIn = this.authService.isLoggedIn();
  
    console.log('Is user logged in:', this.isLoggedIn);
  
    if (this.isLoggedIn) {
      this.budgetService.loadFromLocalStorage(); 
      this.expenseService.loadFromLocalStorage();
    } else {
      this.router.navigate(['/login']);
    }
  }

  onDayChange(day: string) {
    this.showDaily = day !== 'summary';
    this.showSummary = day === 'summary';
    this.selectedDay = day;
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.router.navigate(['/login']);
  }
}
