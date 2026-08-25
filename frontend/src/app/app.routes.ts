import { Routes } from '@angular/router';
import { S2pDashboardComponent } from './features/s2p/s2p-dashboard.component';
import { TaxCalculatorComponent } from './features/producers/tax-calculator.component';
import { ArticleListComponent } from './features/articles/article-list.component';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { businessGuard } from './core/guards/business.guard';
import { ChangePasswordComponent } from './features/account/change-password.component';
import { authGuard } from './core/guards/auth.guard';


export const routes: Routes = [
    { path: '', redirectTo: 's2p', pathMatch: 'full' },
    { path: 's2p', component: S2pDashboardComponent },
    { path: 'producers', component: TaxCalculatorComponent, canActivate: [businessGuard] },
    { path: 'articles', component: ArticleListComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'account', component: ChangePasswordComponent, canActivate: [authGuard] },
];