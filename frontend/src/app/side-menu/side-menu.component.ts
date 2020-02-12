import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ConfigService} from '../services/config/config.service';
import {MenuItem, MenuService} from '../menu/menu.service';
import {NavigationEnd, Router} from '@angular/router';
import {SessionStore} from '../store/session.store';
import {SessionQuery} from '../store/session.query';
import {animate, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'ige-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
  animations: [
    trigger('toggle', [
      transition(':enter', [
        style({ height: 0, opacity: 0}),
        animate('300ms ease-in', style({ height: 48, opacity: 1 }))
      ]),
      transition(':leave', [
        style({ height: 48, opacity: 1 }),
        animate('300ms ease-out', style({ height: 0, opacity: 0 }))
      ])
    ])
  ]
})
export class SideMenuComponent implements OnInit {

  showDrawer: Observable<boolean>;

  routes: MenuItem[];

  menuIsExpanded = true;

  currentRoute: string;

  constructor(private router: Router, private configService: ConfigService, private menuService: MenuService,
              private session: SessionQuery) {
  }

  ngOnInit() {

    this.session.isSidebarExpanded$.subscribe(expanded => this.menuIsExpanded = expanded);

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // console.log('Event: ', event.url);
        this.currentRoute = event.url;
      }
    });

    // display the drawer if the user has at least one catalog assigned
    this.showDrawer = this.configService.$userInfo.pipe(
      map(info => info.assignedCatalogs.length > 0)
    );

    this.menuService.menu$.subscribe(() => {
      console.log('menu has changed');
      this.routes = this.menuService.menuItems;
    });

  }

  toggleSidebar(setExanded: boolean) {
    this.menuService.toggleSidebar(setExanded);
  }

  mapRouteToMatIcon(path: string) {
    switch (path) {
      case '/user': return 'supervised_user_circle';
      case '/catalogs': return 'library_books';
    }
  }

  mapRouteToIcon(path: string) {
    switch (path) {
      case '/dashboard': return 'Uebersicht';
      case '/form': return 'Daten';
      case '/address': return 'Adressen';
      // case '/user': return 'addresses';
      // case '/plugins': return 'extension';
      case '/importExport': return 'Im-Export';
      // case '/catalogs': return 'addresses';
      // case '/demo': return 'play_circle_outline';
      default: return null;
    }
  }
}
