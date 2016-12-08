import {Component, OnInit, ViewChild, enableProdMode} from '@angular/core';
import {MenuService} from './menu/menu.service';
import {PluginsService} from './plugins/plugins.service';
import {StatisticPlugin} from './plugins/statistic/statistic.plugin';
import {WorkflowPlugin} from './plugins/workflow/workflow.plugin';
import {DemoPlugin} from './plugins/demo/demo.plugin';
import {Modal} from 'ng2-modal';
import {ModalService} from './services/modal/modal.service';

// enableProdMode();

@Component( {
  selector: 'my-app',
  template: `
    <div>
      <!-- MENU -->
      <main-menu></main-menu>
      
      <help-panel></help-panel>
      
      <!-- PAGES -->
      <router-outlet></router-outlet>
      
      <!-- TEST -->
      <!--<button (click)="addMenuItem('dynamic Item')">Add menu item</button>-->
    </div>
    
    
    <modal #errorModal modalClass="error" title="Fehler" submitButtonLabel="Ok" (onSubmit)="errorModal.close()">
        <modal-content>
            <p>Es ist ein Fehler aufgetreten:</p>
            <p class="text-danger">{{dynDialog.errorMessage}}</p>
            <p>{{dynDialog.errorMessageMore}}</p>
        </modal-content>
    </modal>
  `,
  providers: [MenuService, PluginsService, StatisticPlugin, WorkflowPlugin, DemoPlugin],
  entryComponents: []
} )
export class AppComponent implements OnInit {

  @ViewChild('errorModal') errorModal: Modal;

  dynDialog: any = { errorMessage: '' };

  constructor(private pluginsService: PluginsService, private modalService: ModalService) {

    // TODO: make more error info collapsible
    this.modalService.errorDialog$.subscribe((content: any) => {
      this.dynDialog.errorMessage = content.message;
      this.dynDialog.errorMessageMore = content.moreInfo;
      this.errorModal.open();
    });
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
