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

  sessionCounter = -1;

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

    const timeAuth = +(KeycloakService.auth.authz.tokenParsed.auth_time + '000');
    const timeExpire = +(KeycloakService.auth.authz.tokenParsed.exp + '000');
    const now = new Date().getTime();
    const timeExpireInMinutes = +((timeExpire - now) / 1000 / 60);

    if ( timeExpireInMinutes > 30) {
      this.sessionCounter = timeExpireInMinutes;
    } else {
      this.sessionCounter = 30 - ((now - timeAuth) / 1000 / 60);
    }
  }

  changeCatalog(catalogId: string) {
    console.log('Change catalog to: ' + catalogId);
  }

  logout() {
    // this.authService.logout();
    this.keycloak.logout();
  }
}
