import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PluginsComponent} from './behaviours.component';
import {routing} from './behaviours.routing';
import {DemoComponent} from './system/demo/demo.component';
import {Collapse} from '../directives/collapse.directive';
import {PasteDialogComponent} from './system/CopyCutPaste/paste-dialog.component';
import {SharedModule} from '../shared.module';
import {CreateFolderComponent} from './system/folder/create-folder.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DeleteDialogComponent} from './toolbar/deleteDocs/delete-dialog.component';
import {StatisticComponent} from './system/statistic/statistic.component';
import {IsoViewComponent} from './toolbar/isoView/iso-view.component';
import {
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatDialogModule,
  MatInputModule,
  MatTabsModule
} from '@angular/material';
import {PrintViewDialogComponent} from '../dialogs/print-view/print-view-dialog.component';
import {RouterModule, Routes} from "@angular/router";

const routes: Routes = [
  {
    path: '',
    component: PluginsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes), CommonModule, FormsModule, ReactiveFormsModule, SharedModule, routing, MatCardModule, MatTabsModule,
  MatDialogModule, MatButtonModule, MatInputModule, MatCheckboxModule],
  declarations: [
    PluginsComponent, DemoComponent, Collapse, PasteDialogComponent, PrintViewDialogComponent, IsoViewComponent,
    CreateFolderComponent, DeleteDialogComponent, StatisticComponent],
  entryComponents: [
    PrintViewDialogComponent, IsoViewComponent, PasteDialogComponent, CreateFolderComponent, DeleteDialogComponent,
    StatisticComponent],
  exports: [RouterModule]
})
export class PluginsModule {
}
