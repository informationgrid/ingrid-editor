import {RouterModule} from '@angular/router';
import {PluginsComponent} from './plugins.component';
import {AuthGuard} from "../security/auth.guard";

export const routing = RouterModule.forChild([
  { path: 'plugins', component: PluginsComponent, canActivate: [AuthGuard]}
]);