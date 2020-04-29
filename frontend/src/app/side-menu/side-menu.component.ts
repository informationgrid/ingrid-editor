import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ConfigService} from '../services/config/config.service';
import {MenuItem, MenuService} from '../menu/menu.service';
import {NavigationEnd, Router} from '@angular/router';
import {SessionQuery} from '../store/session.query';
import {animate, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'ige-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
  animations: [
    trigger('toggle', [
      transition('collapsed => expanded', [
        style({width: 56}),
        animate('300ms ease-in', style({width: 300}))
      ]),
      transition('* => collapsed', [
        style({width: 300}),
        animate('300ms ease-out', style({width: 56}))
      ])
    ])
  ]
})
export class SideMenuComponent implements OnInit {

  showDrawer: Observable<boolean>;

  menuItems: MenuItem[];

  menuIsExpanded = true;

  currentRoute: string;
  toggleState = 'collapsed';

  constructor(private router: Router, private configService: ConfigService, private menuService: MenuService,
              private session: SessionQuery) {
  }

  ngOnInit() {

    this.session.isSidebarExpanded$.subscribe(expanded => this.menuIsExpanded = expanded);

    this.router.events.subscribe(event => this.handleCurrentRoute(event));

    // display the drawer if the user has at least one catalog assigned
    this.showDrawer = this.configService.$userInfo.pipe(
      map(info => info.assignedCatalogs.length > 0)
    );

    this.menuService.menu$.subscribe(() => {
      console.log('menu has changed');
      this.menuItems = this.menuService.menuItems;
    });

  }

  private handleCurrentRoute(event: any) {
    if (event instanceof NavigationEnd) {
      const urlPath = event.url.split(';')[0];
      this.currentRoute = urlPath === '/' ? '/dashboard' : urlPath;
    }
  }

  toggleSidebar(setExanded: boolean) {
    this.menuService.toggleSidebar(setExanded);
    this.toggleState = setExanded ? 'expanded' : 'collapsed';
  }

  mapRouteToIcon(path: string) {
    switch (path) {
      case '/dashboard':
        return 'Uebersicht';
      case '/form':
        return 'Daten';
      case '/address':
        return 'Adressen';
      case '/research':
        return 'Recherche';
      case '/user':
        return 'Nutzer';
      // case '/plugins': return 'extension';
      case '/importExport':
        return 'Im-Export';
      case '/catalogs':
        return 'Katalog';
      default:
        return null;
    }
  }
}
