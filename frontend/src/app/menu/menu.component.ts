import {Component, OnInit} from '@angular/core';
import {KeycloakService} from '../security/keycloak/keycloak.service';
import { ApiService } from '../services/ApiService';
import {MenuService} from "api";

@Component({
  selector: 'main-menu',
  templateUrl: './menu.component.html',
  styles: [`
    nav { z-index: 999; }
    .example-spacer {
      flex: 1 1 auto;
    }
  `]
})
export class MenuComponent implements OnInit {

  routes: any[] = [];
  isLoggedIn = false;

  sessionCounter = -1;

  constructor(private menuService: MenuService, private apiService: ApiService) {
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

    /*if (!environment.mockKeycloak) {
      Observable.interval(1000).subscribe(() => {
        this.sessionCounter--;
        if (this.sessionCounter < 0) {
          // window.location.reload(true );
          console.warn('session timeout ... should inform user and/or reload');
        }
      });
    }*/
  }

  changeCatalog(catalogId: string) {
    console.log('Change catalog to: ' + catalogId);
  }

  logout() {
    // this.authService.logout();
    this.apiService.logout().subscribe( () => {
      window.location.reload( true );
    })
  }
}
