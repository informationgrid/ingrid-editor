import {Component, OnInit, ViewChild} from '@angular/core';
import {MenuComponent} from './menu/menu.component';
import {MenuService} from './menu/menu.service';
import {PluginsService} from './plugins/plugins.service';
import {StatisticPlugin} from './plugins/statistic/statistic.plugin';
import {WorkflowPlugin} from './plugins/workflow/workflow.plugin';
import {FormToolbarService} from './+form/toolbar/form-toolbar.service';
import {DemoPlugin} from './plugins/demo/demo.plugin';
import {BehaviourService} from './services/behaviour/behaviour.service';
import {BehavioursDefault} from './services/behaviour/behaviours';
import {FormularService} from './services/formular/formular.service';
import {TranslateService} from 'ng2-translate/src/translate.service';
import {Modal} from "ng2-modal";
import {ModalService} from "./services/modal/modal.service";

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
    
    
    <modal #errorModal modalClass="error" title="Fehler" submitButtonLabel="Ok" (onSubmit)="errorModal.close()">
        <modal-content>
            <p>Es ist ein Fehler aufgetreten:</p>
            <p class="text-danger">{{dynDialog.errorMessage}}</p>
        </modal-content>
    </modal>
  `,
  providers: [MenuService, PluginsService, StatisticPlugin, WorkflowPlugin, DemoPlugin],
  entryComponents: []
} )
export class AppComponent implements OnInit {

  @ViewChild('errorModal') errorModal: Modal;

  dynDialog = { errorMessage: '' };

  constructor(private pluginsService: PluginsService, translate: TranslateService, private modalService: ModalService) {
    // this language will be used as a fallback when a translation isn't found in the current language
    translate.setDefaultLang( 'en' );

    // the lang to use, if the lang isn't available, it will use the current loader to get them
    translate.use( 'de' );


    this.modalService.errorDialog$.subscribe((content) => {
      this.dynDialog.errorMessage = content.message;
      this.errorModal.open();
    })
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
