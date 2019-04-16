import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from "./security/auth.guard";
// import {LoginComponent} from './security/login.component';

export const routes: Routes = [
  {path: 'dashboard', loadChildren: './+dashboard/dashboard.module#DashboardModule', canActivate: [AuthGuard]},
  // {path: 'form', loadChildren: '+form/ige-form.module', canActivate: [AuthGuard]},
  {path: 'form', loadChildren: './+form/ige-form.module#IgeFormModule', canActivate: [AuthGuard]},
  // {path: 'form/:id', loadChildren: './+form/ige-form.module#IgeFormModule'},
  {path: 'plugins', loadChildren: './+behaviours/behaviours.module#PluginsModule', canActivate: [AuthGuard]},
  {path: 'fields', loadChildren: './+fields/fields.module#FieldsModule', canActivate: [AuthGuard]},
  {path: 'user', loadChildren: './+user/user.module#UserModule'}, // TODO: check canActivateChild: [AuthGuard],
  {path: 'importExport', loadChildren: './+importExport/import-export.module#ImportExportModule', canActivate: [AuthGuard]},
  {path: 'catalogs', loadChildren: './+catalog/catalog.module#CatalogModule'},
  {path: 'demo', loadChildren: './+demo-layout/demo-layout.module#DemoLayoutModule'},
  // {path: 'login', component: LoginComponent},
  {path: '', redirectTo: '/form', pathMatch: 'full'}
];

export const appRoutingProviders: any[] = [];

export const routing = RouterModule.forRoot(routes);
