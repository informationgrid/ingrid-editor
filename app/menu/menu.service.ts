import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {Subject} from 'rxjs';
import {AuthService} from '../services/security/auth.service';

interface MenuItem {
  name: string;
  path: string;
  onlyAdmin?: boolean;
}

@Injectable()
export class MenuService {

  menu: Subject<void> = new Subject<void>();
  menu$ = this.menu.asObservable();

  _menuItems: MenuItem[] = [
    {name: 'Dashboard', path: '/dashboard'},
    {name: 'Form', path: '/form/-2'},
    {name: 'Plugins', path: '/plugins', onlyAdmin: true},
    // {name: 'Fields', path: '/fields'}
    {name: 'Benutzer', path: '/user', onlyAdmin: true}
  ];

  constructor(private router: Router, private authService: AuthService) {
  }

  get menuItems(): MenuItem[] {
    let validPages = this.authService.getAccessiblePages();

    if (validPages.length === 0) {
      return this._menuItems;
    } else {
      return this._menuItems.filter(item => validPages.indexOf(item.path) !== -1);
    }
  }

  addMenuItem(label: string, path: string, component: any) {
    let routerConfig = this.router.config;
    routerConfig.push(
      {path: path, component: component}
    );
    this._menuItems.push(
      {name: label, path: '/' + path}
    );
    this.menu.next( null );
  }

  removeMenuItem(path: string) {
    let indexToRemove = this.router.config.findIndex( (item: any) => item.path === path );
    this.router.config.splice( indexToRemove, 1 );

    indexToRemove = this._menuItems.findIndex( (item: any) => item.path === '/' + path );
    this._menuItems.splice( indexToRemove, 1 );

    this.menu.next( null );
  }

}