import {Routes, RouterModule} from '@angular/router';
import {DashboardComponent} from './+dashboard/dashboard.component';
import {DynamicFormComponent} from './form/dynamic-form.component';

const routes: Routes = [
  {path: 'dashboard', component: DashboardComponent},
  {path: 'form', component: DynamicFormComponent},
  {path: 'form/:id', component: DynamicFormComponent},
  {path: 'plugins', loadChildren: 'plugins/plugins.module'},
  {path: '', redirectTo: '/form', pathMatch: 'full'}
];

export const appRoutingProviders: any[] = [

];

export const routing = RouterModule.forRoot(routes);