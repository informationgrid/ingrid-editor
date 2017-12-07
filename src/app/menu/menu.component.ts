import {Component, OnInit} from '@angular/core';
import {MenuService} from './menu.service';
import {KeycloakService} from '../keycloak/keycloak.service';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';

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

    /*const timeAuth = +(KeycloakService.auth.authz.tokenParsed.auth_time + '000');
    const timeExpire = +(KeycloakService.auth.authz.tokenParsed.exp + '000');
    const now = new Date().getTime();
    const timeExpireInMinutes = +((timeExpire - now) / 1000 / 60);

    if ( timeExpireInMinutes > 30) {
      this.sessionCounter = timeExpireInMinutes;
    } else {
      this.sessionCounter = 30 - ((now - timeAuth) / 1000 / 60);
    }*/

    KeycloakService.tokenObserver.subscribe( token => {
      const now = new Date().getTime();
      const timeExpire = +(token.exp + '000');
      const timeExpireInSeconds = +((timeExpire - now) / 1000);
      this.sessionCounter = timeExpireInSeconds;
    });

    if (!environment.mockKeycloak) {
      Observable.interval(1000).subscribe(() => {
        this.sessionCounter--;
        if (this.sessionCounter < 0) {
          // window.location.reload(true );
          console.warn('session timeout ... should inform user and/or reload');
        }
      });
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
