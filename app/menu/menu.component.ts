import {Component, OnInit} from '@angular/core';
import {ROUTER_DIRECTIVES} from '@angular/router';

@Component( {
  moduleId: module.id,
  selector: 'menu',
  template: require( './menu.component.html' ),
  directives: [ROUTER_DIRECTIVES]
} )
export class MenuComponent implements OnInit {
  constructor() {
  }

  ngOnInit() {
  }


}