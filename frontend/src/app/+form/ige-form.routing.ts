import {Routes} from '@angular/router';
import {AuthGuard} from '../security/auth.guard';
import {FormChangeDeactivateGuard} from '../security/form-change.guard';
import {ListFormWizardsComponent} from '../wizard/list-form-wizards/list-form-wizards.component';
import {OpenDataWizardComponent} from '../wizard/open-data-wizard/open-data-wizard.component';
import {FormComponent} from './form/form.component';

export const routing: Routes = [
  {
    path: '',
    component: FormComponent,
    canActivate: [AuthGuard/*, NoCatalogAssignedGuard*/],
    data: {roles: ['author', 'admin']},
    canDeactivate: [FormChangeDeactivateGuard],
    children: [
      {path: '', component: ListFormWizardsComponent, outlet: 'wizard', pathMatch: 'full'},
      {path: 'opendata', component: OpenDataWizardComponent, outlet: 'wizard'}
    ]
  }
];
