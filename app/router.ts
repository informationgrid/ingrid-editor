import {Routes, RouterModule} from "@angular/router";

const routes: Routes = [
  {path: 'dashboard', loadChildren: '+dashboard/dashboard.module'},
  {path: 'form', loadChildren: '+form/ige-form.module'},
  {path: 'form/:id', loadChildren: '+form/ige-form.module'},
  {path: 'plugins', loadChildren: 'plugins/plugins.module'},
  {path: '', redirectTo: '/form', pathMatch: 'full'}
];

export const appRoutingProviders: any[] = [];

export const routing = RouterModule.forRoot(routes);