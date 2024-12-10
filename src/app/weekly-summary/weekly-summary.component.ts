  import { Component } from '@angular/core';
  import { ChartType, ChartData } from 'chart.js';
  import { saveAs } from 'file-saver';
  import * as ExcelJS from 'exceljs';

  import { WeeklyBudget } from '../services/budget.service';
  import { BudgetService } from '../services/budget.service';
  import { Expense, ExpenseService } from '../services/expense.service';
import { AuthService } from '../services/auth.service';

  @Component({
    selector: 'app-weekly-summary',
    templateUrl: './weekly-summary.component.html',
    styleUrl: './weekly-summary.component.css',
    standalone: false
})
  export class WeeklySummaryComponent {
    expensesByDay: { [day: string]: Expense[] } = {};
    weeklyTotal: number | null = null;
    showWeeklyTotal: boolean = false;
    weeklyBudgets: WeeklyBudget[] = [];
    currentWeeklyBudget: number | null = null;
    weeklyBudgetFormVisible: boolean = false;
    currentWeek: number = 1;

    pieChartType: ChartType = 'pie';
    pieChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [
      {
        data: [], 
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
      },
    ],
  };
  
  constructor(
    private expenseService: ExpenseService,
    private budgetService: BudgetService,
    private authService: AuthService
  ) {
    this.refreshExpenses();
    this.refreshWeeklyBudgets();
  }

    getDays(): string[] {
      return Object.keys(this.expensesByDay);
    }

    refreshExpenses() {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        this.expenseService.getExpensesGroupedByDay(currentUser).subscribe((expenses) => {
          this.expensesByDay = expenses.reduce((acc: { [day: string]: Expense[] }, expense: Expense) => {
            acc[expense.day] = acc[expense.day] || [];
            acc[expense.day].push(expense);
            return acc;
          }, {});
          this.generatePieChart();
        });
      }
    }
  
    refreshWeeklyBudgets() {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        this.budgetService.getWeeklyBudgets(currentUser).subscribe((budgets) => {
          this.weeklyBudgets = budgets;
        });
      }
    }

    calculateWeeklyTotal() {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) return;
  
      this.expenseService.calculateWeeklyTotal(currentUser).subscribe((result) => {
        this.weeklyTotal = result.total;
        this.showWeeklyTotal = true;
      });
    }

    generatePieChart() {
      const categoryTotals: { [key: string]: number } = {};
  
      Object.values(this.expensesByDay).forEach((dayExpenses) => {
        dayExpenses.forEach((expense) => {
          categoryTotals[expense.category] =
            (categoryTotals[expense.category] || 0) + expense.amount;
        });
      });
  
      this.pieChartData.labels = Object.keys(categoryTotals); 
      this.pieChartData.datasets[0].data = Object.values(categoryTotals);
    }

    showWeeklyBudgetForm() {
      this.weeklyBudgetFormVisible = true;
    }

    saveWeeklyBudget(): void {
      const currentUser = this.authService.getCurrentUser();
      const budget = this.currentWeeklyBudget;
      if (!currentUser || budget === null || budget <= 0) {
        console.error('Invalid state to save weekly budget.');
        return;
      }
    
      this.expenseService.calculateWeeklyTotal(currentUser).subscribe((result) => {
        const weeklyTotal = result.total;
    
        this.budgetService.saveWeeklyBudget(budget, weeklyTotal).subscribe(() => {
          this.refreshWeeklyBudgets();
          this.weeklyBudgetFormVisible = false;
        });
      });
    }
  
    nextWeek() {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        console.error('No user logged in. Cannot proceed to the next week.');
        return;
      }
    
      this.expenseService.resetWeeklyExpenses(currentUser).subscribe(() => {
        this.budgetService.incrementWeek();
        this.currentWeek = this.budgetService.getCurrentWeek();
    
        this.expenseService.getExpensesGroupedByDay(currentUser).subscribe((expenses) => {
          this.expensesByDay = expenses.reduce((acc: { [day: string]: Expense[] }, expense: Expense) => {
            acc[expense.day] = acc[expense.day] || [];
            acc[expense.day].push(expense);
            return acc;
          }, {});
          this.generatePieChart();
        });
      });
    }
    
    calculateTotalSavings(): number {
    return this.weeklyBudgets.reduce((total, week) => total + week.savings, 0);
  }

  resetWeeklyBudgets(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.error('No user logged in. Cannot reset weekly budgets.');
      return;
    }
  
    this.budgetService.resetCurrentWeek().subscribe(() => {
      this.budgetService.getWeeklyBudgets(currentUser).subscribe((budgets) => {
        this.weeklyBudgets = budgets;
      });
      this.currentWeek = this.budgetService.getCurrentWeek();
    });
  }
  

  exportToExcel(): void {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Weekly Expenses');

    worksheet.columns = [
      { header: 'Day', key: 'day', width: 10 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Amount', key: 'amount', width: 15 },
    ];

    Object.keys(this.expensesByDay).forEach((day) => {
      this.expensesByDay[day].forEach((expense) => {
        worksheet.addRow({
          day: day,
          category: expense.category,
          amount: expense.amount,
        });
      });
    });

    worksheet.getRow(1).font = { bold: true }; 
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      saveAs(blob, 'WeeklyExpenses.xlsx');
    });
  }
}
