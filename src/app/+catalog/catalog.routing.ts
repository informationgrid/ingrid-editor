import {RouterModule} from '@angular/router';
import {AuthGuard} from '../security/auth.guard';
import {CatalogManagerComponent} from './catalog-manager/catalog-manager.component';

export const routing = RouterModule.forChild([
  {
    path: 'catalogs',
    component: CatalogManagerComponent,
    canActivate: [AuthGuard],
    data: { roles: ['admin', 'author'] }
  }
]);
