import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {Observable, Observer} from 'rxjs';

interface MenuItem {
  name: string;
  path: string;
}

@Injectable()
export class MenuService {

  menu$: Observable<MenuItem>;
  menuObserver: Observer<MenuItem>;

  constructor(private router: Router) {
    this.menu$ = new Observable<MenuItem>( (observer: any) => this.menuObserver = observer );
  }

  addMenuItem(label: string, path: string, component: any) {
    let routerConfig = this.router.config;
    routerConfig.push(
      {path: path, component: component}
    );
    this.menuObserver.next( { name: label, path: path } );
  }

}