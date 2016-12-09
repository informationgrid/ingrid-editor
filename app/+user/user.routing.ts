import {RouterModule} from '@angular/router';
import {UserComponent} from './user.component';
import {AuthGuard} from '../security/auth.guard';

export const routing = RouterModule.forChild([
  {path: 'user', component: UserComponent, canActivate: [AuthGuard]}
]);