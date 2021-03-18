import {RouterModule} from '@angular/router';
import {AuthGuard} from '../security/auth.guard';
import {CatalogManagerComponent} from './catalog-manager/catalog-manager.component';
import {BehavioursChangedGuard} from './behaviours-changed.guard';
import {CatalogsComponent} from './catalogs/catalogs.component';

export const routing = RouterModule.forChild( [
  {
    path: '',
    component: CatalogManagerComponent,
    canActivate: [AuthGuard],
    canDeactivate: [BehavioursChangedGuard],
    data: {roles: ['admin', 'author']}
  },
  {
    path: 'manage',
    component: CatalogsComponent,
    canActivate: [AuthGuard],
    data: {roles: ['admin']}
  }
] );
