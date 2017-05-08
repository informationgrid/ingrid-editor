import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PluginsComponent} from './behaviours.component';
import {routing} from './behaviours.routing';
import {DemoComponent} from './system/demo/demo.component';
import {PublishPlugin} from './system/publish/publish.plugin';
import {CreateDocRulesPlugin} from './system/CreateRules/create-rules.behaviour';
import {Collapse} from '../directives/collapse.directive';
import {BehaviourService} from './behaviour.service';
import {MenuService} from '../menu/menu.service';
import {PasteDialogComponent} from './system/CopyCutPaste/paste-dialog.component';
import {ModalModule} from 'ngx-modal';
import {SharedModule} from '../shared.module';
import {PrintViewComponent} from './system/printView/print-view.component';
import {CreateFolderComponent} from './system/folder/create-folder.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

@NgModule( {
  imports: [CommonModule, ModalModule, FormsModule, ReactiveFormsModule, SharedModule, routing],
  declarations: [PluginsComponent, DemoComponent, Collapse, PasteDialogComponent, PrintViewComponent, CreateFolderComponent],
  providers: [MenuService, BehaviourService, PublishPlugin, CreateDocRulesPlugin],
  entryComponents: [DemoComponent, PasteDialogComponent, PrintViewComponent, CreateFolderComponent]
} )
export class PluginsModule {
}
