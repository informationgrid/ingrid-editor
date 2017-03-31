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
import {ModalModule} from 'ng2-modal';
import {SharedModule} from '../shared.module';

@NgModule( {
  imports: [CommonModule, ModalModule, SharedModule, routing],
  declarations: [PluginsComponent, DemoComponent, Collapse, PasteDialogComponent],
  providers: [MenuService, BehaviourService, PublishPlugin, CreateDocRulesPlugin],
  entryComponents: [DemoComponent, PasteDialogComponent]
} )
export class PluginsModule {
}