import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DailyExpensesComponent } from "../daily-expenses/daily-expenses.component";
import { WeeklySummaryComponent } from '../weekly-summary/weekly-summary.component';

  @Component({
    selector: 'app-tabs',
    templateUrl: './tabs.component.html',
    styleUrl: './tabs.component.scss',
    imports: [CommonModule, DailyExpensesComponent, WeeklySummaryComponent],
    standalone: true
})
  export class TabsComponent {
    days: string[] = ['MON', 'TUES', 'WED', 'THUR', 'FRI', 'SAT', 'SUN'];
    selectedDay: string | null = null;

    @Output() dayChanged = new EventEmitter<string>();

    changeDay(day: string | null) {
      if (day) { 
        this.selectedDay = day;
        this.dayChanged.emit(day);
      }
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
