import {RouterModule} from '@angular/router';
import {AuthGuard} from '../security/auth.guard';
import {UserManagementComponent} from './user-management/user-management.component';

export const routing = RouterModule.forChild([
  {
    path: '',
    component: UserManagementComponent,
    canActivate: [AuthGuard],
    data: {roles: ['admin']}
  }
]);
