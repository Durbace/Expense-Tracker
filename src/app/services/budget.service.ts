import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { AuthService } from './auth.service';

export interface WeeklyBudget {
  id?: string; 
  weekNumber: number;
  budget: number;
  expenses: number;
  savings: number;
}

@Injectable({
  providedIn: 'root',
})
export class BudgetService {
  private apiUrl = 'http://localhost:5000'; 
  private currentWeek: number = 1; 
  private currentWeeklyBudget: WeeklyBudget | null = null; 

  constructor(private http: HttpClient, private authService: AuthService) {}

  saveWeeklyBudget(budget: number, expenses: number): Observable<WeeklyBudget | null> {
    return this.authService.getCurrentUser().pipe(
      switchMap((userId) => {
        if (userId) {
          const savings = budget - expenses;
          return this.http.post<WeeklyBudget>(`${this.apiUrl}/budgets`, {
            userId, 
            weekNumber: this.currentWeek,
            budget,
            expenses,
            savings,
          }, { withCredentials: true });
        } else {
          console.error('No user logged in. Cannot save weekly budget.');
          return of(null);
        }
      })
    );
  }
  
  

  incrementWeek(): void {
    this.currentWeek++;
    this.currentWeeklyBudget = null;
  }

  setCurrentWeeklyBudget(budget: number): void {
    this.currentWeeklyBudget = {
      weekNumber: this.currentWeek,
      budget,
      expenses: 0,
      savings: budget,
    };
  }

  getCurrentWeeklyBudget(): Observable<WeeklyBudget | null> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.error('No user logged in. Cannot fetch current weekly budget.');
      return of(null);
    }

    return this.http
      .get<WeeklyBudget>(`${this.apiUrl}/budgets/current/${currentUser}`, { withCredentials: true })
      .pipe(
        map((budget) => {
          if (budget) {
            this.currentWeeklyBudget = budget;
            this.currentWeek = budget.weekNumber;
          }
          return budget;
        })
      );
  }

  getWeeklyBudgets(userId: string): Observable<{ budgets: WeeklyBudget[] }> {
    return this.http.get<{ budgets: WeeklyBudget[] }>(`${this.apiUrl}/budgets/${userId}`, { withCredentials: true });
  }
  

  calculateTotalSavings(): Observable<number> {
    return this.authService.getCurrentUser().pipe(
      switchMap((userId) => {
        if (!userId) {
          console.error('No user logged in. Cannot calculate total savings.');
          return of(0); 
        }
  
        return this.getWeeklyBudgets(userId).pipe(
          map((response) => {
            if (response && Array.isArray(response.budgets)) {
              return response.budgets.reduce((total, budget) => total + budget.savings, 0);
            } else {
              console.error('Unexpected response format:', response);
              return 0;
            }
          })
        );
      })
    );
  }
  

  getCurrentWeek(): number {
    return this.currentWeek;
  }

  resetCurrentWeek(): Observable<any> {
    return this.authService.getCurrentUser().pipe(
      switchMap((userId) => {
        if (!userId || typeof userId !== 'string') {
          console.error('Invalid user ID:', userId);
          return of(null);
        }
        this.currentWeek = 1;
        this.currentWeeklyBudget = null;
        return this.http.delete(`${this.apiUrl}/budgets/reset/${userId}`, { withCredentials: true });
      })
    );
  }
  
}
