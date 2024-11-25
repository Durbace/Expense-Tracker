import { Component, Input, SimpleChanges, OnChanges } from '@angular/core';

import { Expense, ExpenseService } from '../services/expense.service';

@Component({
    selector: 'app-daily-expenses',
    templateUrl: './daily-expenses.component.html',
    styleUrl: './daily-expenses.component.css',
    standalone: false
})
export class DailyExpensesComponent implements OnChanges {
  @Input() selectedDay!: string;

  expenses: Expense[] = [];
  currentCategory: string = '';
  currentAmount: number | null = null;
  showAddExpense: boolean = false;
  editingExpenseId: number | null = null;
  expenseCount: number = 1; 
  categories: string[] = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Clothing', 'Health'];
  dailyTotal: number | null = null;
  days: string[] = ['MON', 'TUES', 'WED', 'THUR', 'FRI', 'SAT', 'SUN'];
  showDailyTotal: boolean = false;

  constructor(private expenseService: ExpenseService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedDay']) { 
      if (changes['selectedDay'].currentValue !== changes['selectedDay'].previousValue) {
        this.refreshExpenses();
        this.closeAddExpense();
      }
    }
  }

  toggleAddExpense() {
    this.showAddExpense = !this.showAddExpense;
    if (this.showAddExpense && this.editingExpenseId == null) { 
      this.currentCategory = '';
      this.currentAmount = null;
      this.expenseCount = this.expenses.length + 1;
    }
  }

  closeAddExpense() {
    this.showAddExpense = false;
    this.resetForm();
  }

  addExpense() {
    if (!this.currentCategory || this.currentAmount == null) return;
    const newExpense: Expense = {
      id: Date.now(),
      day: this.selectedDay,
      category: this.currentCategory,
      amount: this.currentAmount
    };
    this.expenseService.addExpense(newExpense.day, newExpense.category, newExpense.amount);
    this.resetForm();
    this.closeAddExpense();
  }
  
  updateExpense() {
    if (!this.currentCategory || this.currentAmount == null || this.editingExpenseId == null) return;
    this.expenseService.editExpense(this.selectedDay, this.editingExpenseId, this.currentCategory, this.currentAmount);
    this.resetForm();
    this.closeAddExpense();
  }

  editExpense(expense: Expense) {
    this.currentCategory = expense.category;
    this.currentAmount = expense.amount;
    this.editingExpenseId = expense.id;
    this.showAddExpense = true;
  }

  deleteExpense(id: number) {
    this.expenseService.deleteExpense(this.selectedDay, id);
    this.resetForm();
  }

  resetForm() {
    this.refreshExpenses();
    this.showAddExpense = false;
    this.editingExpenseId = null;
    this.currentCategory = '';
    this.currentAmount = null;
    this.dailyTotal = null;
  }

  refreshExpenses() {
    if(this.selectedDay) {
      this.expenses = this.expenseService.getExpensesGroupedByDay()[this.selectedDay] || [];
    }
  }

  calculateDailyTotal() {
    if (this.showDailyTotal) {
      this.dailyTotal = null;
      this.showDailyTotal = false;
    } else {
      this.dailyTotal = this.expenses.reduce((total, expense) => total + expense.amount, 0);
      this.showDailyTotal = true;
    }
  }

  changeDay(day: string) {
    this.selectedDay = day;
    this.refreshExpenses(); 
  }

 getPreviousDay(): string | null {
    const index = this.days.indexOf(this.selectedDay!); 
    return index > 0 ? this.days[index - 1] : null;
  }

  getNextDay(): string | null {
    const index = this.days.indexOf(this.selectedDay!); 
    return index >= 0 && index < this.days.length - 1 ? this.days[index + 1] : null;
  }
}
