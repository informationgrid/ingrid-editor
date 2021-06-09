import {RouterModule} from '@angular/router';
import {AuthGuard} from '../security/auth.guard';
import {CatalogSettingsComponent} from './catalog-settings.component';
import {CatalogCodelistsComponent} from "./codelists/catalog-codelists.component";
import {IndexingComponent} from "./indexing/indexing.component";
import {BehavioursComponent} from "./+behaviours/behaviours.component";

export const routing = RouterModule.forChild([
  {
    path: '',
    component: CatalogSettingsComponent,
    canActivate: [AuthGuard],
    // canDeactivate: [BehavioursChangedGuard],
    data: {roles: ['admin']},
    children: [{
      path: '',
      redirectTo: 'codelists'
    }, {
      path: 'codelists',
      component: CatalogCodelistsComponent
    }, {
      path: 'form-behaviours',
      component: BehavioursComponent
    }, {
      path: 'catalog-behaviours',
      component: BehavioursComponent
    }, {
      path: 'indexing',
      component: IndexingComponent
    }]
  }
]);
