import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PluginsComponent} from './behaviours.component';
import {routing} from './behaviours.routing';
import {Collapse} from '../directives/collapse.directive';
import {SharedModule} from '../shared.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatDialogModule,
  MatInputModule,
  MatTabsModule
} from '@angular/material';
import {RouterModule, Routes} from "@angular/router";
import {FormFieldsModule} from "../form-fields/form-fields.module";
import {PasteDialogComponent} from "./system/CopyCutPaste/paste-dialog.component";
import {PrintViewDialogComponent} from "../dialogs/form/print-view/print-view-dialog.component";
import {CreateFolderComponent} from "./system/folder/create-folder.component";
import {DeleteDialogComponent} from "./toolbar/deleteDocs/delete-dialog.component";
import {IsoViewComponent} from "./toolbar/isoView/iso-view.component";
import {DemoComponent} from "./system/demo/demo.component";
import {StatisticComponent} from "./system/statistic/statistic.component";

const routes: Routes = [
  {
    path: '',
    component: PluginsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes), CommonModule, FormsModule, ReactiveFormsModule, SharedModule, routing, MatCardModule, MatTabsModule, MatDialogModule,
  MatButtonModule, MatInputModule, MatCheckboxModule, FormFieldsModule],
  declarations: [
    PluginsComponent, Collapse,
    PasteDialogComponent, PrintViewDialogComponent, CreateFolderComponent,
    IsoViewComponent, DemoComponent, StatisticComponent
  ],
  entryComponents: [],
  exports: [RouterModule]
})
export class PluginsModule {
}
