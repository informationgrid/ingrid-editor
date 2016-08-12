import {Component, OnInit} from '@angular/core';
import {ROUTER_DIRECTIVES} from '@angular/router';
import {MenuComponent} from './menu/menu.component';
import {MenuService} from './menu/menu.service';
import {PluginsService} from './plugins/plugins.service';
import {StatisticPlugin} from './plugins/statistic/statistic.plugin';
import {WorkflowPlugin} from './plugins/workflow/workflow.plugin';
import {FormToolbarService} from './form/toolbar/form-toolbar.service';
import {DemoPlugin} from './plugins/demo/demo.plugin';
import {BehaviourService} from './services/behaviour/behaviour.service';
import {BehavioursDefault} from './services/behaviour/behaviours';
import {FormularService} from './services/formular/formular.service';

// enableProdMode();

@Component( {
  selector: 'my-app',
  template: `
    <div>
      <!-- MENU -->
      <main-menu></main-menu>
      
      <!-- PAGES -->
      <router-outlet></router-outlet>
      
      <!-- TEST -->
      <!--<button (click)="addMenuItem('dynamic Item')">Add menu item</button>-->
    </div>
  `,
  directives: [ROUTER_DIRECTIVES, MenuComponent],
  providers: [MenuService, PluginsService, FormToolbarService, StatisticPlugin, WorkflowPlugin, DemoPlugin, BehaviourService, BehavioursDefault, FormularService],
  entryComponents: []
} )
export class AppComponent implements OnInit {

  constructor(private pluginsService: PluginsService) {
  }

  ngOnInit() {
    let plugins = this.pluginsService.getPlugins();
    console.log( 'got plugins:', plugins );
    plugins
      .filter( plugin => plugin.isActive )
      .forEach( plugin => {
        console.log( 'register plugin: ' + plugin.name );
        plugin.register();
      } );
  }

}
