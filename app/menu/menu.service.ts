import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {Observable, Observer} from 'rxjs';

interface MenuItem {
  name: string;
  path: string;
}

@Injectable()
export class MenuService {

  menu$: Observable<void>;
  menuObserver: Observer<void>;

  _menuItems: MenuItem[] = [
    {name: 'Dashboard', path: '/dashboard'},
    {name: 'Form', path: '/form'},
    {name: 'Plugins', path: '/plugins'}
  ];

  constructor(private router: Router) {
    this.menu$ = new Observable<void>( (observer: any) => this.menuObserver = observer );
  }

  get menuItems(): MenuItem[] {
    return this._menuItems;
  }

  addMenuItem(label: string, path: string, component: any) {
    let routerConfig = this.router.config;
    routerConfig.push(
      {path: path, component: component}
    );
    this._menuItems.push(
      {name: label, path: '/' + path}
    );
    this.menuObserver.next( null );
  }

  removeMenuItem(path: string) {
    let indexToRemove = this.router.config.findIndex( (item: any) => item.path === path );
    this.router.config.splice( indexToRemove, 1 );

    indexToRemove = this._menuItems.findIndex( (item: any) => item.path === '/' + path );
    this._menuItems.splice( indexToRemove, 1 );

    this.menuObserver.next( null );
  }

}