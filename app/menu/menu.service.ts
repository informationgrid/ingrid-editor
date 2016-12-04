import {Injectable} from "@angular/core";
import {Router} from "@angular/router";
import {Subject} from "rxjs";

interface MenuItem {
  name: string;
  path: string;
}

@Injectable()
export class MenuService {

  menu$: Subject<void>;

  _menuItems: MenuItem[] = [
    {name: 'Dashboard', path: '/dashboard'},
    {name: 'Form', path: '/form/-2'},
    {name: 'Plugins', path: '/plugins'},
    // {name: 'Fields', path: '/fields'}
    {name: 'Benutzer', path: '/user'}
  ];

  constructor(private router: Router) {
    this.menu$ = new Subject<void>();
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