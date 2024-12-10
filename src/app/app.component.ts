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
    this.isLoggedIn = this.authService.isLoggedIn();

    if (this.isLoggedIn) {
      console.log('User is logged in.');

      // Încarcă datele din baza de date
      this.loadUserData();
    } else {
      console.log('User is not logged in. Redirecting to welcome...');
      this.router.navigate(['/welcome']);
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
    this.router.navigate(['/welcome']);
  }

  private loadUserData(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.error('No user logged in.');
      return;
    }

    this.budgetService.getWeeklyBudgets(currentUser).subscribe({
      next: (budgets) => {
        console.log('Weekly budgets loaded:', budgets);
      },
      error: (err) => {
        console.error('Failed to load weekly budgets:', err);
      }
    });

    this.expenseService.getExpensesGroupedByDay(currentUser).subscribe({
      next: (expenses) => {
        console.log('Expenses loaded:', expenses);
      },
      error: (err) => {
        console.error('Failed to load expenses:', err);
      }
    });
  }
}
