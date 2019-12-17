import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from "./security/auth.guard";
// import {LoginComponent} from './security/login.component';

export const routes: Routes = [
  {path: 'dashboard', loadChildren: () => import('./+dashboard/dashboard.module').then(m => m.DashboardModule), canActivate: [AuthGuard]},
  // {path: 'form', loadChildren: '+form/ige-form.module', canActivate: [AuthGuard]},
  {path: 'form', loadChildren: () => import('./+form/ige-form.module').then(m => m.IgeFormModule), canActivate: [AuthGuard]},
  // {path: 'form/:id', loadChildren: './+form/ige-form.module#IgeFormModule'},
  // {path: 'plugins', loadChildren: () => import('./+behaviours/behaviours.module').then(m => m.PluginsModule), canActivate: [AuthGuard]},
  {path: 'user', loadChildren: () => import('./+user/user.module').then(m => m.UserModule)}, // TODO: check canActivateChild: [AuthGuard],
  {path: 'importExport', loadChildren: () => import('./+importExport/import-export.module').then(m => m.ImportExportModule), canActivate: [AuthGuard]},
  {path: 'catalogs', loadChildren: () => import('./+catalog/catalog.module').then(m => m.CatalogModule)},
  // {path: 'demo', loadChildren: () => import('./+demo-layout/demo-layout.module').then(m => m.DemoLayoutModule)},
  // {path: 'login', component: LoginComponent},
  {path: '', redirectTo: '/form', pathMatch: 'full'}
];

export const appRoutingProviders: any[] = [];

export const routing = RouterModule.forRoot(routes);
