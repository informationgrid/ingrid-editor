import {RouterModule} from '@angular/router';
import {DynamicFormComponent} from './dynamic-form.component';
import {AuthGuard} from '../security/auth.guard';
import {FormChangeDeactivateGuard} from '../security/form-change.guard';
import {StatisticComponent} from '../+behaviours/system/statistic/statistic.component';
import {ListFormWizardsComponent} from '../wizard/list-form-wizards/list-form-wizards.component';
import {OpenDataWizardComponent} from '../wizard/open-data-wizard/open-data-wizard.component';

export const routing = RouterModule.forChild([
  {
    path: 'form',
    component: DynamicFormComponent,
    canActivate: [AuthGuard],
    data: { roles: ['author', 'admin'] },
    canDeactivate: [FormChangeDeactivateGuard],
    children: [
      {path: '', component: ListFormWizardsComponent, outlet: 'wizard', pathMatch: 'full' },
      {path: 'opendata', component: OpenDataWizardComponent, outlet: 'wizard'}
    ]
  }
]);
