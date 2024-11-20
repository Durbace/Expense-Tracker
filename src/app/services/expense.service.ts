import { Injectable } from '@angular/core';

export interface Expense {
  id: number;
  day: string;
  category: string;
  amount: number;
}

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private expenses: { [key: string]: Expense[] } = {};

  constructor() {
    this.loadExpenses();
  }

  private loadExpenses() {
    const expensesFromStorage = localStorage.getItem('expenses');
    if (expensesFromStorage) {
      this.expenses = JSON.parse(expensesFromStorage);
    } else {
      this.initStorage();
    }
  }

  private initStorage() {
    this.expenses = {
      'MON': [], 'TUES': [], 'WED': [], 'THUR': [], 'FRI': [], 'SAT': [], 'SUN': []
    };
    this.updateLocalStorage();
  }

  addExpense(day: string, category: string, amount: number) {
    const newExpense: Expense = {
      id: Date.now(),
      day: day,
      category: category,
      amount: amount
    };
    this.expenses[day] = this.expenses[day] || [];
    this.expenses[day].push(newExpense);
    this.updateLocalStorage();
  }

  editExpense(day: string, id: number, category: string, amount: number) {
    const expenseIndex = this.expenses[day].findIndex(exp => exp.id === id);
    if (expenseIndex !== -1) {
      this.expenses[day][expenseIndex].category = category;
      this.expenses[day][expenseIndex].amount = amount;
      this.updateLocalStorage();
    }
  }

  deleteExpense(day: string, id: number) {
    this.expenses[day] = this.expenses[day].filter(expense => expense.id !== id);
    this.updateLocalStorage();
  }

  private updateLocalStorage() {
    localStorage.setItem('expenses', JSON.stringify(this.expenses));
  }

  getExpensesGroupedByDay(): { [day: string]: Expense[] } {
    return this.expenses;
  }
}
