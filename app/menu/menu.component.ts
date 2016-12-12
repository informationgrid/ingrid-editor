import {Component, OnInit} from '@angular/core';
import {MenuService} from './menu.service';
import {MenuItem} from 'ag-grid';
import {AuthService} from '../services/security/auth.service';

@Component({
  selector: 'main-menu',
  template: require('./menu.component.html')
})
export class MenuComponent implements OnInit {

  routes: MenuItem[] = [];
  isLoggedIn: boolean = false;

  constructor(private menuService: MenuService, private authService: AuthService) {
    this.routes = this.menuService.menuItems;
  }

  ngOnInit() {
    this.menuService.menu$.subscribe(() => {
      console.log('menu has changed');
      this.routes = this.menuService.menuItems;
    });

    // remember logged in state
    this.authService.loginStatusChange$.subscribe(loggedIn => {
      this.isLoggedIn = loggedIn;
      this.routes = this.menuService.menuItems;
    });

    // get initial login state when page is loaded
    this.isLoggedIn = this.authService.loggedIn();
  }

  logout() {
    this.authService.logout();
  }
}