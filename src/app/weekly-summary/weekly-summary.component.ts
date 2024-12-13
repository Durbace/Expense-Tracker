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
      this.authService.getCurrentUser().subscribe((userId) => {
        if (userId) { 
          console.log('Current user ID:', userId);
          this.expenseService.getExpensesGroupedByDay(userId).subscribe((response) => {
            if (response && Array.isArray(response.expenses)) {
              this.expensesByDay = response.expenses.reduce((acc: { [day: string]: Expense[] }, expense: Expense) => {
                acc[expense.day] = acc[expense.day] || [];
                acc[expense.day].push(expense);
                return acc;
              }, {});
              this.generatePieChart();
            } else {
              console.error('Unexpected response format:', response);
            }
          });
        } else {
          console.warn('No user logged in.');
        }
      });
    }
    
  
    refreshWeeklyBudgets() {
      this.authService.getCurrentUser().subscribe((userId) => {
        if (userId) {
          this.budgetService.getWeeklyBudgets(userId).subscribe((response) => {
            if (response && Array.isArray(response.budgets)) {
              this.weeklyBudgets = response.budgets;
    
              const totalExpenses = Object.values(this.expensesByDay).reduce((sum, dayExpenses) => {
                return sum + dayExpenses.reduce((daySum, expense) => daySum + expense.amount, 0);
              }, 0);
    
              if (this.weeklyBudgets.length > 0) {
                const currentBudget = this.weeklyBudgets.find((budget) => budget.weekNumber === this.currentWeek);
                if (currentBudget) {
                  currentBudget.expenses = totalExpenses; 
                }
              }
            } else {
              console.error('Unexpected response format:', response);
            }
          });
        } else {
          console.warn('No user authenticated. Cannot refresh weekly budgets.');
        }
      });
    }
    

    calculateWeeklyTotal() {
      this.authService.getCurrentUser().subscribe((userId) => {
        if (userId) { // Verifică dacă există un userId valid
          this.expenseService.calculateWeeklyTotal(userId).subscribe((result) => {
            if (result && result.total) {
              this.weeklyTotal = result.total;
              this.showWeeklyTotal = true;
            } else {
              console.error('No total calculated or wrong response format');
              this.showWeeklyTotal = false;
            }
          });
        } else {
          console.warn('No user authenticated. Cannot calculate weekly total.');
          this.showWeeklyTotal = false;
        }
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

    saveWeeklyBudget() {
      const budget = this.currentWeeklyBudget || 0;
      const expenses = this.calculateTotalExpenses(); 
    
      this.budgetService.saveWeeklyBudget(budget, expenses).subscribe({
        next: (result) => {
          if (result) {
            console.log('Budget saved successfully:', result); 
            this.refreshWeeklyBudgets();
            this.weeklyBudgetFormVisible = false;
          } else {
            console.warn('Failed to save budget. No user logged in.');
          }
        },
        error: (err) => {
          console.error('Error saving budget:', err);
        },
      });
    }
    
    calculateTotalExpenses(): number {
      return Object.values(this.expensesByDay).reduce((total, dayExpenses) => {
        return total + dayExpenses.reduce((dayTotal, expense) => dayTotal + expense.amount, 0);
      }, 0);
    }
    
  
    nextWeek(): void {
      this.authService.getCurrentUser().subscribe((userId) => {
        if (!userId) {
          console.error('No user logged in. Cannot proceed to the next week.');
          return;
        }
    
        this.expenseService.resetWeeklyExpenses(userId).subscribe(() => {
          this.budgetService.incrementWeek();
          this.currentWeek = this.budgetService.getCurrentWeek();
    
          this.expenseService.getExpensesGroupedByDay(userId).subscribe((response) => {
            const expensesArray = response?.expenses;
    
            if (Array.isArray(expensesArray)) {
              this.expensesByDay = expensesArray.reduce((acc: { [day: string]: Expense[] }, expense: Expense) => {
                acc[expense.day] = acc[expense.day] || [];
                acc[expense.day].push(expense);
                return acc;
              }, {});
              this.generatePieChart();
            } else {
              console.error('Unexpected response format:', response);
            }
          });
        });
      });
    }
    
    
    calculateTotalSavings(): number {
    return this.weeklyBudgets.reduce((total, week) => total + week.savings, 0);
  }

  resetWeeklyBudgets(): void {
    this.authService.getCurrentUser().subscribe((userId) => {
      if (!userId) {
        console.error('No user logged in. Cannot reset weekly budgets.');
        return;
      }
  
      this.budgetService.resetCurrentWeek().subscribe(() => {
        this.budgetService.getWeeklyBudgets(userId).subscribe((response) => {
          if (response && Array.isArray(response.budgets)) {
            this.weeklyBudgets = response.budgets;
          } else {
            console.error('Unexpected response format:', response);
            this.weeklyBudgets = [];
          }
        });
  
        this.currentWeek = this.budgetService.getCurrentWeek();
      });
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

  private groupExpensesByDay(expenses: Expense[]): { [day: string]: Expense[] } {
    const grouped = expenses.reduce((acc, expense) => {
      const day = expense.day;
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(expense);
      return acc;
    }, {} as { [day: string]: Expense[] });
    return grouped;
  }
}
