import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private apiUrl = 'http://localhost:5000';

  constructor(private http: HttpClient) {}

  addExpense(userId: string, day: string, category: string, amount: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/expenses`, { userId, day, category, amount });
  }

  deleteExpense(expenseId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/expenses/${expenseId}`);
  }

  getExpensesGroupedByDay(userId: string): Observable<{ expenses: Expense[] }> {
    return this.http.get<{ expenses: Expense[] }>(`${this.apiUrl}/expenses/${userId}`);
  }

  resetWeeklyExpenses(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/expenses/reset/${userId}`);
  }

  calculateWeeklyTotal(userId: string): Observable<{ total: number }> {
    return this.http.get<{ total: number }>(`${this.apiUrl}/expenses/calculate/weekly-total/${userId}`);
  }

  editExpense(expenseId: string, category: string, amount: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/expenses/${expenseId}`, { category, amount });
  }  
}
