import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {BehaviorSubject} from 'rxjs';
import {SessionStore} from '../store/session.store';

export interface MenuItem {
  name: string;
  path: string;
  onlyAdmin?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  _menuItems: MenuItem[] = [
    {name: 'Übersicht', path: '/dashboard'},
    {name: 'Formular', path: '/form'},
    {name: 'Address', path: '/address'},
    // {name: 'Plugins', path: '/plugins', onlyAdmin: true},
    // {name: 'Fields', path: '/fields'}
    {name: 'Benutzer', path: '/user', onlyAdmin: true},
    {name: 'Im-/Export', path: '/importExport', onlyAdmin: true},
    {name: 'Katalogverwaltung', path: '/catalogs', onlyAdmin: true}
    // {name: 'Demo', path: '/demo'}
  ];

  menu$ = new BehaviorSubject<MenuItem[]>(this._menuItems);

  constructor(private router: Router, private sessionStore: SessionStore) {
  }

  get menuItems(): MenuItem[] {
    const validPages = []; // this.authService.getAccessiblePages();

    if (validPages.length === 0) {
      return this._menuItems;
    } else {
      return this._menuItems.filter(item => validPages.indexOf(item.path) !== -1);
    }
  }

  addMenuItem(label: string, path: string, component: any) {
    const routerConfig = this.router.config;
    routerConfig.push(
      {path: path, component: component}
    );
    this._menuItems.push(
      {name: label, path: '/' + path}
    );
    this.menu$.next(null);
  }

  removeMenuItem(path: string) {
    let indexToRemove = this.router.config.findIndex((item: any) => item.path === path);
    this.router.config.splice(indexToRemove, 1);

    indexToRemove = this._menuItems.findIndex((item: any) => item.path === '/' + path);
    this._menuItems.splice(indexToRemove, 1);

    this.menu$.next(null);
  }

  toggleSidebar(setExpanded: boolean) {
    this.sessionStore.update(state => ({
      ui: {
        ...state.ui,
        sidebarExpanded: setExpanded
      }
    }));
  }
}
