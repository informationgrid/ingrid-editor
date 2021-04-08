import {RouterModule} from '@angular/router';
import {AuthGuard} from '../security/auth.guard';
import {CatalogSettingsComponent} from './catalog-settings.component';
import {BehavioursChangedGuard} from './behaviours-changed.guard';

export const routing = RouterModule.forChild( [
  {
    path: '',
    component: CatalogSettingsComponent,
    canActivate: [AuthGuard],
    // canDeactivate: [BehavioursChangedGuard],
    data: {roles: ['admin']}
  }
] );
