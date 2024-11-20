import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  selectedDay: string | null = null;
  showDaily: boolean = true;
  showSummary: boolean = false;

  ngOnInit(): void {
    this.selectedDay = null;
  }

  onDayChange(day: string) {
    this.showDaily = day !== 'summary';
    this.showSummary = day === 'summary';
    this.selectedDay = day;
  }
}
