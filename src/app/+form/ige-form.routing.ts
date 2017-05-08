import {RouterModule} from '@angular/router';
import {DynamicFormComponent} from './dynamic-form.component';
import {AuthGuard} from '../security/auth.guard';
import {FormChangeDeactivateGuard} from '../security/form-change.guard';

export const routing = RouterModule.forChild([
  {
    path: 'form',
    component: DynamicFormComponent,
    canActivate: [AuthGuard],
    data: { roles: ['author', 'admin'] },
    canDeactivate: [FormChangeDeactivateGuard]
  },
  {
    path: 'form/:id',
    component: DynamicFormComponent,
    canActivate: [AuthGuard],
    data: { roles: ['author', 'admin'] },
    canDeactivate: [FormChangeDeactivateGuard]
  }
]);