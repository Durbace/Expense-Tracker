import { Component, Input, SimpleChanges, OnChanges } from '@angular/core';

import { Expense, ExpenseService } from '../services/expense.service';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-daily-expenses',
    templateUrl: './daily-expenses.component.html',
    styleUrl: './daily-expenses.component.css',
    standalone: false
})
export class DailyExpensesComponent implements OnChanges {
  @Input() selectedDay: string = 'MON';
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

  constructor(private expenseService: ExpenseService, private authService: AuthService) {}

  ngOnInit(): void {
    if (!this.selectedDay) {
      this.selectedDay = this.days[0]; 
    }
    this.refreshExpenses();
  }


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
    }
  }

  closeAddExpense() {
    this.showAddExpense = false;
    this.resetForm();
  }

  addExpense() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !this.currentCategory || this.currentAmount == null) return;
  
    this.expenseService
      .addExpense(currentUser, this.selectedDay, this.currentCategory, this.currentAmount)
      .subscribe(() => {
        this.refreshExpenses();
        this.expenseCount++; 
        this.closeAddExpense();
      });
  }
  
  updateExpense() {
    if (!this.currentCategory || this.currentAmount == null || this.editingExpenseId == null) return;

    this.expenseService
      .editExpense(this.editingExpenseId.toString(), this.currentCategory, this.currentAmount)
      .subscribe(() => {
        this.refreshExpenses();
        this.closeAddExpense();
      });
  }

  editExpense(expense: Expense) {
    this.currentCategory = expense.category;
    this.currentAmount = expense.amount;
    this.editingExpenseId = expense.id;
    this.showAddExpense = true;
  }

  deleteExpense(id: number) {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;
  
    this.expenseService.deleteExpense(id.toString()).subscribe(() => {
      this.refreshExpenses();
      this.expenseCount = Math.max(0, this.expenseCount - 1); 
    });
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
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.expenseService.getExpensesGroupedByDay(currentUser).subscribe((expenses) => {
        this.expenses = expenses.filter((expense) => expense.day === this.selectedDay);
        this.expenseCount = this.expenses.length; 
      });
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
