import { Injectable } from '@angular/core';

import { AuthService } from './auth.service';

export interface Expense {
  id: number;
  day: string;
  category: string;
  amount: number;
}

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  private expenses: { [key: string]: Expense[] } = {};

  constructor(private authService: AuthService) {
    this.loadFromLocalStorage();
  }

  addExpense(day: string, category: string, amount: number): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.error('No user logged in. Cannot add expense.');
      return;
    }

    const newExpense: Expense = {
      id: Date.now(),
      day,
      category,
      amount,
    };

    this.expenses[day] = this.expenses[day] || [];
    this.expenses[day].push(newExpense);
    this.saveToLocalStorage();
  }

  deleteExpense(day: string, id: number): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.error('No user logged in. Cannot delete expense.');
      return;
    }

    this.expenses[day] = this.expenses[day]?.filter(expense => expense.id !== id) || [];
    this.saveToLocalStorage();
  }

  getExpensesGroupedByDay(): { [key: string]: Expense[] } {
    return this.expenses;
  }

  private saveToLocalStorage(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.error('No user logged in. Cannot save expenses.');
      return;
    }

    localStorage.setItem(`expenses_${currentUser}`, JSON.stringify(this.expenses));
  }

  public loadFromLocalStorage(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.error('No user logged in. Cannot load expenses.');
      this.expenses = {};
      return;
    }

    const storedExpenses = localStorage.getItem(`expenses_${currentUser}`);
    if (storedExpenses) {
      this.expenses = JSON.parse(storedExpenses);
    } else {
      this.expenses = {};
    }
  }

  resetWeeklyExpenses(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.error('No user logged in. Cannot reset expenses.');
      return;
    }
  
    this.expenses = {};
    this.saveToLocalStorage();
  }

  calculateWeeklyTotal(): number {
    return Object.values(this.expenses)
      .flat()
      .reduce((total, expense) => total + expense.amount, 0);
  }

  editExpense(day: string, id: number, category: string, amount: number): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.error('No user logged in. Cannot edit expense.');
      return;
    }
  
    const expenseIndex = this.expenses[day]?.findIndex(expense => expense.id === id);
    if (expenseIndex !== -1 && expenseIndex !== undefined) {
      this.expenses[day][expenseIndex].category = category;
      this.expenses[day][expenseIndex].amount = amount;
      this.saveToLocalStorage();
    } else {
      console.error('Expense not found. Cannot edit.');
    }
  }
  
}
