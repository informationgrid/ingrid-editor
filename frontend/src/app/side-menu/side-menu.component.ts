import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ConfigService} from '../services/config/config.service';
import {MenuItem, MenuService} from '../menu/menu.service';
import {NavigationEnd, Router} from '@angular/router';
import {SessionStore} from '../store/session.store';
import {SessionQuery} from '../store/session.query';

@Component({
  selector: 'ige-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss']
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

  mapRouteToIcon(path: string) {
    switch (path) {
      case '/dashboard': return 'dashboard';
      case '/form': return 'description';
      case '/user': return 'people';
      case '/plugins': return 'extension';
      case '/importExport': return 'import_export';
      case '/catalogs': return 'build';
      case '/demo': return 'play_circle_outline';
      default: return 'exit_to_app';
    }
  }
}
