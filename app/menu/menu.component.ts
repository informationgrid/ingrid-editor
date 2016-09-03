import {Component, OnInit} from "@angular/core";
import {MenuService} from "./menu.service";
import {MenuItem} from "ag-grid";

@Component({
  selector: 'main-menu',
  template: require('./menu.component.html')
})
export class MenuComponent implements OnInit {

  routes: MenuItem[] = [];

  constructor(private menuService: MenuService) {
    this.routes = this.menuService.menuItems;
  }

  ngOnInit() {
    this.menuService.menu$.asObservable().subscribe(() => {
      console.log('menu has changed');
      this.routes = this.menuService.menuItems;
    });
  }


}