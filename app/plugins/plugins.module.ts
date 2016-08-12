import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PluginsComponent} from './plugins.component';
import {PluginsService} from './plugins.service';
import {routing} from './plugins.routing';
import {DemoComponent} from './demo/demo.component';
@NgModule( {
  imports: [CommonModule, routing],
  declarations: [PluginsComponent, DemoComponent],
  providers: [PluginsService],
  entryComponents: [DemoComponent]
} )
export class PluginsModule {
}