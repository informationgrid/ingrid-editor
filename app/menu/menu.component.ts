import {Component, OnInit} from '@angular/core';
import {ROUTER_DIRECTIVES} from '@angular/router';
import {MenuService} from './menu.service';
import {MenuItem} from 'ag-grid';

@Component( {
  moduleId: module.id,
  selector: 'main-menu',
  template: require( './menu.component.html' ),
  directives: [ROUTER_DIRECTIVES]
} )
export class MenuComponent implements OnInit {

  routes: MenuItem[] = [];

  constructor(private menuService: MenuService) {
    this.routes = this.menuService.menuItems;
  }

  ngOnInit() {
    this.menuService.menu$.subscribe( () => {
      console.log( 'menu has changed' );
      this.routes = this.menuService.menuItems;
    } );
  }


}