import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {Subject} from 'rxjs';

interface MenuItem {
  name: string;
  path: string;
  onlyAdmin?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  menu$: Subject<void> = new Subject<void>();

  _menuItems: MenuItem[] = [
    {name: 'Dashboard', path: '/dashboard'},
    {name: 'Formular', path: '/form'},
    {name: 'Plugins', path: '/plugins', onlyAdmin: true},
    // {name: 'Fields', path: '/fields'}
    {name: 'Benutzer', path: '/user', onlyAdmin: true},
    {name: 'Im-/Export', path: '/importExport', onlyAdmin: true},
    {name: 'Katalogverwaltung', path: '/catalogs', onlyAdmin: true}
  ];

  constructor(private router: Router) {
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
      {path: path, loadChildren: component}
    );
    this._menuItems.push(
      {name: label, path: '/' + path}
    );
    this.menu$.next( null );
  }

  removeMenuItem(path: string) {
    let indexToRemove = this.router.config.findIndex( (item: any) => item.path === path );
    this.router.config.splice( indexToRemove, 1 );

    indexToRemove = this._menuItems.findIndex( (item: any) => item.path === '/' + path );
    this._menuItems.splice( indexToRemove, 1 );

    this.menu$.next( null );
  }

}
