import {RouterModule, Routes} from '@angular/router';
// import {LoginComponent} from './security/login.component';

export const routes: Routes = [
  {path: 'dashboard', loadChildren: './+dashboard/dashboard.module'},
  // {path: 'form', loadChildren: '+form/ige-form.module', canActivate: [AuthGuard]},
  {path: 'form', loadChildren: './+form/ige-form.module#IgeFormModule'},
  // {path: 'form/:id', loadChildren: './+form/ige-form.module#IgeFormModule'},
  {path: 'plugins', loadChildren: './+behaviours/behaviours.module'},
  {path: 'fields', loadChildren: './+fields/fields.module'},
  {path: 'user', loadChildren: './+user/user.module'}, // TODO: check canActivateChild: [AuthGuard],
  {path: 'importExport', loadChildren: './+importExport/import-export.module#ImportExportModule'},
  {path: 'catalogs', loadChildren: './+catalog/catalog.module'},
  // {path: 'login', component: LoginComponent},
  {path: '', redirectTo: '/form', pathMatch: 'full'}
];

export const appRoutingProviders: any[] = [];

export const routing = RouterModule.forRoot(routes);
