import {RouterModule} from '@angular/router';
import {AuthGuard} from '../security/auth.guard';
import {CatalogManagerComponent} from './catalog-manager/catalog-manager.component';
import {CatalogDetailComponent} from './catalog-detail/catalog-detail.component';
import {BehavioursChangedGuard} from './behaviours-changed.guard';

export const routing = RouterModule.forChild( [
  {
    path: '',
    component: CatalogManagerComponent,
    canActivate: [AuthGuard],
    canDeactivate: [BehavioursChangedGuard],
    data: {roles: ['admin', 'author']}
  },
  {
    path: ':id',
    component: CatalogDetailComponent,
    canActivate: [AuthGuard],
    data: {roles: ['admin', 'author']}
  }
] );
