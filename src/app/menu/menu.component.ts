import {Component, OnInit} from '@angular/core';
import {MenuService} from './menu.service';
import {KeycloakService} from '../keycloak/keycloak.service';

@Component({
  selector: 'main-menu',
  templateUrl: './menu.component.html'
})
export class MenuComponent implements OnInit {

  routes: any[] = [];
  isLoggedIn = false;

  constructor(private menuService: MenuService, private keycloak: KeycloakService) {
    this.routes = this.menuService.menuItems;
  }

  ngOnInit() {
    this.menuService.menu$.subscribe(() => {
      console.log('menu has changed');
      this.routes = this.menuService.menuItems;
    });

    // remember logged in state
    /*this.authService.loginStatusChange$.subscribe(loggedIn => {
      this.isLoggedIn = loggedIn;
      this.routes = this.menuService.menuItems;
    });*/

    // get initial login state when page is loaded
    this.isLoggedIn = true; // this.authService.loggedIn();
  }

  logout() {
    // this.authService.logout();
    this.keycloak.logout();
  }
}
