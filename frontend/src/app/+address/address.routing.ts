import {RouterModule} from '@angular/router';
import {AuthGuard} from '../security/auth.guard';
import {AddressComponent} from './address/address.component';
import {FormChangeDeactivateGuard} from '../security/form-change.guard';
import {RedirectFormGuard} from '../+form/redirect-form.guard';

export const routing = RouterModule.forChild( [
  {
    path: '',
    component: AddressComponent,
    canActivate: [RedirectFormGuard, AuthGuard],
    canDeactivate: [FormChangeDeactivateGuard]
  }
] );
