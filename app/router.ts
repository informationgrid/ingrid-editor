import {provideRouter, RouterConfig} from '@angular/router';
import {DashboardComponent} from './+dashboard/dashboard.component';
import {DynamicFormComponent} from './form/dynamic-form.component';

const routes: RouterConfig = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'form', component: DynamicFormComponent },
  { path: '', component: DashboardComponent }
];

export const appRouterProviders = [
  provideRouter(routes)
];
