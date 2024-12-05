import { Injectable } from '@angular/core';

import { AuthService } from './auth.service';

export interface WeeklyBudget {
  weekNumber: number;
  budget: number;
  expenses: number;
  savings: number;
}

@Injectable({
  providedIn: 'root',
})
export class BudgetService {
  private weeklyBudgets: WeeklyBudget[] = [];
  private currentWeek: number = 1;
  private currentWeeklyBudget: number | null = null;

  constructor(private authService: AuthService) {}

  saveWeeklyBudget(budget: number, expenses: number): void {
    const savings = budget - expenses;

    const currentWeekIndex = this.weeklyBudgets.findIndex(
        (week) => week.weekNumber === this.currentWeek
      );

      if (currentWeekIndex !== -1) {
        this.weeklyBudgets[currentWeekIndex].budget = budget;
        this.weeklyBudgets[currentWeekIndex].expenses = expenses;
        this.weeklyBudgets[currentWeekIndex].savings = savings;
      } else {
        this.weeklyBudgets.push({
          weekNumber: this.currentWeek,
          budget: budget,
          expenses: expenses,
          savings: savings,
        });
      }

      this.saveToLocalStorage();
    this.currentWeeklyBudget = null;
  }

  incrementWeek(): void {
    this.currentWeek++; 
    this.saveToLocalStorage();
  }

  setCurrentWeeklyBudget(budget: number): void {
    this.currentWeeklyBudget = budget;
    this.saveToLocalStorage();
  }

  getCurrentWeeklyBudget(): number | null {
    return this.currentWeeklyBudget;
  }

  getWeeklyBudgets(): WeeklyBudget[] {
    return this.weeklyBudgets;
  }

  calculateTotalSavings(): number {
    return this.weeklyBudgets.reduce((total, week) => total + week.savings, 0);
  }

  getCurrentWeek(): number {
    return this.currentWeek;
  }

  resetCurrentWeek(): void {
    this.weeklyBudgets = [];
    this.currentWeek = 1;
    this.saveToLocalStorage();
  }

  private saveToLocalStorage(): void {
    const currentUser = this.authService.getCurrentUser(); 
    if (!currentUser) {
      console.error('No user logged in. Cannot save data.');
      return;
    }
  
    
    localStorage.setItem(`weeklyBudgets_${currentUser}`, JSON.stringify(this.weeklyBudgets));
    localStorage.setItem(`currentWeek_${currentUser}`, this.currentWeek.toString());
  }
  

  public loadFromLocalStorage(): void {
    const currentUser = this.authService.getCurrentUser(); 
    if (!currentUser) {
      console.warn('No user logged in. Cannot load data.');
      this.weeklyBudgets = [];
      this.currentWeek = 1;
      return;
    }
  
    const budgets = localStorage.getItem(`weeklyBudgets_${currentUser}`);
    const week = localStorage.getItem(`currentWeek_${currentUser}`);
  
    if (budgets) {
      try {
        this.weeklyBudgets = JSON.parse(budgets);
        if (!Array.isArray(this.weeklyBudgets)) {
          console.error('weeklyBudgets is not an array. Initializing as empty array.');
          this.weeklyBudgets = [];
        }
      } catch (error) {
        console.error('Error parsing weeklyBudgets from localStorage:', error);
        this.weeklyBudgets = [];
      }
    } else {
      console.log('No budgets found in localStorage for user:', currentUser);
      this.weeklyBudgets = [];
    }
  
    if (week) {
      this.currentWeek = parseInt(week, 10);
    } else {
      this.currentWeek = 1;
    }
  }
  
}
