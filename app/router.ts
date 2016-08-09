import {provideRouter, RouterConfig} from '@angular/router';
import {DashboardComponent} from './+dashboard/dashboard.component';
import {PluginsComponent} from './plugins/plugins.component';
import {DynamicFormComponent} from './form/dynamic-form.component';

const routes: RouterConfig = [
  {path: 'dashboard', component: DashboardComponent},
  {path: 'form', component: DynamicFormComponent},
  {path: 'plugins', component: PluginsComponent},
  {path: '', component: DynamicFormComponent}
];

export const appRouterProviders = [
  provideRouter( routes )
];
