import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { AppComponent } from './app.component';
import { AuthGuard } from './services/auth.guard';

const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: '', component: AppComponent, canActivate: [AuthGuard] },
    { path: '**', redirectTo: 'login' },
  ];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
