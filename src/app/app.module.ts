import { NgModule } from '@angular/core';
import { BrowserModule} from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { RouterModule } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { AppComponent } from './app.component';
import { TabsComponent } from './tabs/tabs.component';
import { DailyExpensesComponent } from './daily-expenses/daily-expenses.component';
import { WeeklySummaryComponent } from './weekly-summary/weekly-summary.component'
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { AppRoutingModule } from './app-routing.module';



@NgModule({
  declarations: [
    AppComponent,
    TabsComponent,
    DailyExpensesComponent,
    WeeklySummaryComponent,
    LoginComponent,
    SignupComponent,
    WelcomeComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    NgChartsModule,
    RouterModule,
    AppRoutingModule
  ],
  providers: [
    provideHttpClient(), 
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
