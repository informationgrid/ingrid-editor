import {Component, OnInit} from '@angular/core';
import {MenuService} from './menu.service';
import {MenuItem} from 'ag-grid';
import {ModalService} from "../services/modal/modal.service";
import {AuthService} from "../services/security/auth.service";

@Component({
  selector: 'main-menu',
  template: require('./menu.component.html')
})
export class MenuComponent implements OnInit {

  routes: MenuItem[] = [];

  constructor(private menuService: MenuService, private modalService: ModalService, private authService: AuthService) {
    this.routes = this.menuService.menuItems;
  }

  ngOnInit() {
    this.menuService.menu$.asObservable().subscribe(() => {
      console.log('menu has changed');
      this.routes = this.menuService.menuItems;
    });
  }

  logout() {
    this.authService.logout();
  }
}