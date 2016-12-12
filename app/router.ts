import {Routes, RouterModule} from '@angular/router';
import {LoginComponent} from './security/login.component';

const routes: Routes = [
  {path: 'dashboard', loadChildren: '+dashboard/dashboard.module'},
  // {path: 'form', loadChildren: '+form/ige-form.module', canActivate: [AuthGuard]},
  {path: 'form/:id', loadChildren: '+form/ige-form.module'},
  {path: 'plugins', loadChildren: 'plugins/plugins.module'},
  {path: 'fields', loadChildren: '+fields/fields.module'},
  {path: 'user', loadChildren: '+user/user.module'}, // TODO: check canActivateChild: [AuthGuard],
  {path: 'login', component: LoginComponent},
  {path: '', redirectTo: '/form', pathMatch: 'full'}
];

export const appRoutingProviders: any[] = [];

export const routing = RouterModule.forRoot(routes);