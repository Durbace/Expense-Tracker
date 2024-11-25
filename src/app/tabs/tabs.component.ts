  import { Component, EventEmitter, Output } from '@angular/core';

  @Component({
    selector: 'app-tabs',
    templateUrl: './tabs.component.html',
    styleUrl: './tabs.component.css',
    standalone: false
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
