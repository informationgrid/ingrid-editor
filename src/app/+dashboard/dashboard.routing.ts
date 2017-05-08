import {RouterModule} from '@angular/router';
import {DashboardComponent} from './dashboard.component';
import {AuthGuard} from '../security/auth.guard';

export const routing = RouterModule.forChild([
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['admin', 'author'] }
  }
]);