import {RouterModule} from '@angular/router';
import {DashboardComponent} from './dashboard.component';
import {AuthGuard} from '../security/auth.guard';
import {NoCatalogAssignedGuard} from "../security/no-catalog-assigned.guard";

export const routing = RouterModule.forChild([
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard, NoCatalogAssignedGuard],
    data: { roles: ['admin', 'author'] }
  }
]);
