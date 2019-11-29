import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PluginsComponent} from './behaviours.component';
import {routing} from './behaviours.routing';
import {Collapse} from '../directives/collapse.directive';
import {SharedModule} from '../shared/shared.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDialogModule} from '@angular/material/dialog';
import {MatInputModule} from '@angular/material/input';
import {MatTabsModule} from '@angular/material/tabs';
import {RouterModule, Routes} from '@angular/router';
import {FormFieldsModule} from '../form-fields/form-fields.module';
import {PasteDialogComponent} from './system/CopyCutPaste/paste-dialog.component';
import {PrintViewDialogComponent} from '../+form/dialogs/print-view/print-view-dialog.component';
import {DemoComponent} from './system/demo/demo.component';
import {StatisticComponent} from './system/statistic/statistic.component';

const routes: Routes = [
  {
    path: '',
    component: PluginsComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes), CommonModule, FormsModule, ReactiveFormsModule, SharedModule,
    routing, MatCardModule, MatTabsModule, MatDialogModule,
    MatButtonModule, MatInputModule, MatCheckboxModule, FormFieldsModule],
  declarations: [
    PluginsComponent, Collapse,
    PasteDialogComponent, PrintViewDialogComponent,
    DemoComponent, StatisticComponent
  ],
  entryComponents: [],
  exports: [RouterModule]
})
export class PluginsModule {
}
