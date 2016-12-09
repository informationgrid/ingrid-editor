import {RouterModule} from '@angular/router';
import {FieldsComponent} from './fields.component';
import {AuthGuard} from '../security/auth.guard';

export const routing = RouterModule.forChild([
  {path: 'fields', component: FieldsComponent, canActivate: [AuthGuard]}
]);