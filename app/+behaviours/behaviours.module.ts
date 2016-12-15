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
@NgModule( {
  imports: [CommonModule, routing],
  declarations: [PluginsComponent, DemoComponent, Collapse],
  providers: [MenuService, BehaviourService, PublishPlugin, CreateDocRulesPlugin],
  entryComponents: [DemoComponent]
} )
export class PluginsModule {
}