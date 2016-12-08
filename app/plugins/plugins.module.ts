import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PluginsComponent} from './plugins.component';
import {PluginsService} from './plugins.service';
import {routing} from './plugins.routing';
import {DemoComponent} from './demo/demo.component';
import {PublishPlugin} from "./publish/publish.plugin";
import {CreateDocRulesPlugin} from "./CreateRules/create-rules.behaviour";
@NgModule( {
  imports: [CommonModule, routing],
  declarations: [PluginsComponent, DemoComponent],
  providers: [PluginsService, PublishPlugin, CreateDocRulesPlugin],
  entryComponents: [DemoComponent]
} )
export class PluginsModule {
}