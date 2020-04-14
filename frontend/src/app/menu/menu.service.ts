import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {BehaviorSubject} from 'rxjs';
import {SessionStore} from '../store/session.store';
import {ConfigService} from '../services/config/config.service';

export interface MenuItem {
  name: string;
  path: string;
  onlyAdmin?: boolean;
  featureFlag?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  _menuItems: MenuItem[] = [
    {name: 'Übersicht', path: '/dashboard'},
    {name: 'Daten', path: '/form'},
    {name: 'Addressen', path: '/address'},
    {name: 'Research', path: '/research', featureFlag: 'AP3'},
    {name: 'Benutzer', path: '/user', onlyAdmin: true, featureFlag: 'AP3'},
    {name: 'Im-/Export', path: '/importExport', onlyAdmin: true},
    {name: 'Katalogverwaltung', path: '/catalogs', onlyAdmin: true}
  ];

  menu$ = new BehaviorSubject<MenuItem[]>(this._menuItems);

  constructor(private router: Router, private sessionStore: SessionStore, private config: ConfigService) {
  }

  get menuItems(): MenuItem[] {
    return this._menuItems.filter(item => !item.featureFlag || this.config.hasFlags(item.featureFlag));
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
