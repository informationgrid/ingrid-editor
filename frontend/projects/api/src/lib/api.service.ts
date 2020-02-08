import { Injectable } from '@angular/core';
import {MenuService} from './services/menu.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private menuService: MenuService) { }

  addMenu(title: string, path: string, component: any) {
    console.log('Add new menu item: ' + title);
    this.menuService.addMenuItem(title, path, component);
  }

  setFormProfiles(formProfiles: any[]) {
    console.log('Set form profiles: ', formProfiles);

  }
}
