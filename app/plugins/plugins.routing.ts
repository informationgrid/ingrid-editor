import {RouterModule} from '@angular/router';
import {PluginsComponent} from './plugins.component';

export const routing = RouterModule.forChild([
  { path: 'plugins', component: PluginsComponent}
]);