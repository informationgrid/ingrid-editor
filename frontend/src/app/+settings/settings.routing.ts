import {RouterModule} from '@angular/router';
import {SettingsComponent} from './settings.component';

export const routing = RouterModule.forChild([
  {
    path: '',
    redirectTo: 'general'
  }, {
    path: 'general',
    component: SettingsComponent,
    data: {
      index: 0
    }
  }, {
    path: 'codelist',
    component: SettingsComponent,
    data: {
      index: 1
    }
  }, {
    path: 'catalog',
    component: SettingsComponent,
    data: {
      index: 2
    }
  }
]);
