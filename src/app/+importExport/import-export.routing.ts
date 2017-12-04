import {RouterModule} from '@angular/router';
import {AuthGuard} from '../security/auth.guard';
import {ImportExportComponent} from './import/import.component';

export const routing = RouterModule.forChild([
  {
    path: 'importExport',
    component: ImportExportComponent,
    canActivate: [AuthGuard],
    data: { roles: ['admin'] }
  }
]);
