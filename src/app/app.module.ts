import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { TabsComponent } from './tabs/tabs.component';
import { DailyExpensesComponent } from './daily-expenses/daily-expenses.component';
import { WeeklySummaryComponent } from './weekly-summary/weekly-summary.component'

@NgModule({
  declarations: [
    AppComponent,
    TabsComponent,
    DailyExpensesComponent,
    WeeklySummaryComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
