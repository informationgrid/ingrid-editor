import {RouterModule} from '@angular/router';
import {AuthGuard} from '../security/auth.guard';
import {AddressComponent} from './address/address.component';

export const routing = RouterModule.forChild( [
  {
    path: '',
    component: AddressComponent,
    canActivate: [AuthGuard]
  }
] );
