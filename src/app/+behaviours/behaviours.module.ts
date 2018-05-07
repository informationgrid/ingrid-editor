import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PluginsComponent } from './behaviours.component';
import { routing } from './behaviours.routing';
import { DemoComponent } from './system/demo/demo.component';
import { PublishPlugin } from './system/publish/publish.plugin';
import { CreateDocRulesPlugin } from './system/CreateRules/create-rules.behaviour';
import { Collapse } from '../directives/collapse.directive';
import { BehaviourService } from './behaviour.service';
import { MenuService } from '../menu/menu.service';
import { PasteDialogComponent } from './system/CopyCutPaste/paste-dialog.component';
import { SharedModule } from '../shared.module';
import { CreateFolderComponent } from './system/folder/create-folder.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FolderPlugin, CopyCutPastePlugin, StatisticPlugin, WorkflowPlugin, PrintViewPlugin } from '.';
import { DeleteDocsPlugin } from './toolbar/deleteDocs/delete-docs.plugin';
import { DeleteDialogComponent } from './toolbar/deleteDocs/delete-dialog.component';
import { StatisticComponent } from './system/statistic/statistic.component';
import { IsoViewComponent } from './toolbar/isoView/iso-view.component';
import { IsoViewPlugin } from './toolbar/isoView/iso-view.plugin';
import { UndoPlugin } from './system/undo/undo.plugin';
import {
  MatButtonModule, MatCardModule, MatCheckboxModule, MatDialogModule, MatInputModule,
  MatTabsModule
} from '@angular/material';
import { PrintViewDialogComponent } from '../dialogs/print-view/print-view-dialog.component';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SharedModule, routing, MatCardModule, MatTabsModule,
  MatDialogModule, MatButtonModule, MatInputModule, MatCheckboxModule],
  declarations: [
    PluginsComponent, DemoComponent, Collapse, PasteDialogComponent, PrintViewDialogComponent, IsoViewComponent,
    CreateFolderComponent, DeleteDialogComponent, StatisticComponent],
  providers: [
    MenuService, BehaviourService, PublishPlugin, CreateDocRulesPlugin, StatisticPlugin, WorkflowPlugin,
    PrintViewPlugin, IsoViewPlugin, CopyCutPastePlugin, FolderPlugin, DeleteDocsPlugin, UndoPlugin],
  entryComponents: [
    PrintViewDialogComponent, IsoViewComponent, PasteDialogComponent, CreateFolderComponent, DeleteDialogComponent,
    StatisticComponent]
})
export class PluginsModule {
}
