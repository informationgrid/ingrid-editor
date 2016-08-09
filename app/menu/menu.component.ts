import {Component, OnInit} from '@angular/core';
import {ROUTER_DIRECTIVES} from '@angular/router';
import {MenuService} from '../services/menu/menu.service';

@Component( {
  moduleId: module.id,
  selector: 'main-menu',
  template: require( './menu.component.html' ),
  directives: [ROUTER_DIRECTIVES]
} )
export class MenuComponent implements OnInit {

  routes = [
    {name: 'Dashboard', path: '/dashboard'},
    {name: 'Form', path: '/form'},
    {name: 'Plugins', path: '/plugins'}
  ];

  constructor(private menuService: MenuService) {
  }

  ngOnInit() {
    this.menuService.menu$.subscribe( (item) => {
      console.log( 'menu has changed' );
      this.routes.push( item );
    } );
  }


}