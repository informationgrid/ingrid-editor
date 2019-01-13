import {RouterModule, Routes} from '@angular/router';
// import {LoginComponent} from './security/login.component';

export const routes: Routes = [
  {path: 'dashboard', loadChildren: './+dashboard/dashboard.module#DashboardModule'},
  // {path: 'form', loadChildren: '+form/ige-form.module', canActivate: [AuthGuard]},
  {path: 'form', loadChildren: './+form/ige-form.module#IgeFormModule'},
  // {path: 'form/:id', loadChildren: './+form/ige-form.module#IgeFormModule'},
  {path: 'plugins', loadChildren: './+behaviours/behaviours.module#PluginsModule'},
  {path: 'fields', loadChildren: './+fields/fields.module#FieldsModule'},
  {path: 'user', loadChildren: './+user/user.module#UserModule'}, // TODO: check canActivateChild: [AuthGuard],
  {path: 'importExport', loadChildren: './+importExport/import-export.module#ImportExportModule'},
  {path: 'catalogs', loadChildren: './+catalog/catalog.module#CatalogModule'},
  // {path: 'login', component: LoginComponent},
  {path: '', redirectTo: '/form', pathMatch: 'full'}
];

export const appRoutingProviders: any[] = [];

export const routing = RouterModule.forRoot(routes);
