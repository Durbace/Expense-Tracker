import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

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
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const publicPages = ['/welcome', '/login', '/signup'];
        const currentUrl = event.urlAfterRedirects;

        if (publicPages.includes(currentUrl)) {
          this.isLoggedIn = false;
        } else {
          this.checkAuth();
        }
      });
  }
  
  private checkAuth(): void {
    this.authService.isLoggedIn().subscribe(
      (loggedIn) => {
        this.isLoggedIn = loggedIn;
        if (this.isLoggedIn) {
          console.log('User is logged in.');
          this.loadUserData();
        }
      },
      (error) => {
        console.error('Error checking login status:', error);
        this.isLoggedIn = false;
      }
    );
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
    if (!this.isLoggedIn) {
      return;  // Întrerupe executia dacă utilizatorul nu este autentificat
    }

    this.authService.getCurrentUser().subscribe(
      (userId) => {
        if (userId) {  // Verifică dacă există un userId valid
          console.log('User ID:', userId);
          this.budgetService.getWeeklyBudgets(userId).subscribe({
            next: (budgets) => {
              console.log('Weekly budgets loaded:', budgets);
            },
            error: (err) => {
              console.error('Failed to load weekly budgets:', err);
            }
          });

          this.expenseService.getExpensesGroupedByDay(userId).subscribe({
            next: (expenses) => {
              console.log('Expenses loaded:', expenses);
            },
            error: (err) => {
              console.error('Failed to load expenses:', err);
            }
          });
        } else {
          console.error('No user logged in.');
        }
      },
      (error) => {
        console.error('Error fetching current user:', error);
      }
    );
  }

}
