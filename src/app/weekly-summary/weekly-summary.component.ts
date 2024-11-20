  import { Component } from '@angular/core';

  import { Expense, ExpenseService } from '../services/expense.service';

  @Component({
    selector: 'app-weekly-summary',
    templateUrl: './weekly-summary.component.html',
    styleUrl: './weekly-summary.component.css'
  })
  export class WeeklySummaryComponent {
    expensesByDay: { [day: string]: Expense[] } = {};
    weeklyTotal: number | null = null;
    showWeeklyTotal: boolean = false;
  
    constructor(private expenseService: ExpenseService) {
      this.expensesByDay = this.expenseService.getExpensesGroupedByDay();
    }

    getDays(): string[] {
      return Object.keys(this.expensesByDay);
    }

    calculateWeeklyTotal() {
      if (this.showWeeklyTotal) {
        this.weeklyTotal = null;
        this.showWeeklyTotal = false;
      } else {
        let total = 0;
        Object.values(this.expensesByDay).forEach(dayExpenses => {
          dayExpenses.forEach(expense => {
            total += expense.amount;
          });
        });
        this.weeklyTotal = total;
        this.showWeeklyTotal = true;
      }
    }
  }
