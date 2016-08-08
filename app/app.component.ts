import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES} from '@angular/router';
import {MenuComponent} from './menu/menu.component';

@Component( {
  selector: 'my-app',
  template: `
    <div>
      <h2>UVP</h2>
      <!-- MENU -->
      <menu></menu>
      
      <!-- PAGES -->
      <router-outlet></router-outlet>
    </div>
  `,
  directives: [ROUTER_DIRECTIVES, MenuComponent]
} )
export class AppComponent {

}
