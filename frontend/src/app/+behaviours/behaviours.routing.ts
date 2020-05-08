import {RouterModule} from '@angular/router';
import {BehavioursComponent} from './behaviours.component';
import {AuthGuard} from '../security/auth.guard';

export const routing = RouterModule.forChild([
  {
    path: '',
    component: BehavioursComponent,
    canActivate: [AuthGuard],
    data: { roles: ['admin'] }
  }
]);
