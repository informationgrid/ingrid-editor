import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import {
  ConfigService,
  Configuration,
} from "../services/config/config.service";
import { MainMenuService } from "../menu/main-menu.service";
import { NavigationEnd, Route, Router } from "@angular/router";
import { SessionQuery } from "../store/session.query";
import { animate, style, transition, trigger } from "@angular/animations";

@Component({
  selector: "ige-side-menu",
  templateUrl: "./side-menu.component.html",
  styleUrls: ["./side-menu.component.scss"],
  animations: [
    trigger("toggle", [
      transition("collapsed => expanded", [
        style({ width: 56 }),
        animate("300ms ease-in", style({ width: 300 })),
      ]),
      transition("* => collapsed", [
        style({ width: 300 }),
        animate("300ms ease-out", style({ width: 56 })),
      ]),
    ]),
  ],
})
export class SideMenuComponent implements OnInit {
  showDrawer: Observable<boolean>;

  menuItems: Observable<Route[]> = this.menuService.menu$.pipe(
    map((routes) => routes.filter((route) => this.checkIfUserHasAccess(route)))
  );

  menuIsExpanded = true;

  currentRoute: string;
  toggleState = "collapsed";
  catalogId = ConfigService.catalogId;
  configuration: Configuration;

  constructor(
    private router: Router,
    private configService: ConfigService,
    private menuService: MainMenuService,
    private session: SessionQuery
  ) {}

  ngOnInit() {
    this.configuration = this.configService.getConfiguration();
    this.session.isSidebarExpanded$.subscribe(
      (expanded) => (this.menuIsExpanded = expanded)
    );

    this.router.events.subscribe((event) => this.handleCurrentRoute(event));

    // display the drawer if the user has at least one catalog assigned
    this.showDrawer = this.configService.$userInfo.pipe(
      map((info) => info?.assignedCatalogs?.length > 0)
    );
  }

  private handleCurrentRoute(event: any) {
    if (event instanceof NavigationEnd) {
      const urlPath = event.urlAfterRedirects.split(";")[0].substring(1);
      this.currentRoute = urlPath === "" ? "dashboard" : urlPath;
    }
  }

  toggleSidebar(setExanded: boolean) {
    this.menuService.toggleSidebar(setExanded);
    this.toggleState = setExanded ? "expanded" : "collapsed";
  }

  private checkIfUserHasAccess(route: Route): boolean {
    let neededPermission = route.data?.permission;
    return this.configService.hasPermission(neededPermission);
  }

  gotoPage(path: string) {
    const tab = this.session.getValue().ui.currentTab[path];
    if (tab) {
      const tabWithParameter = tab.split(";");
      const newPath = [
        ConfigService.catalogId + "/" + path,
        tabWithParameter[0],
      ];
      if (tabWithParameter.length > 1)
        newPath.push(JSON.parse(tabWithParameter[1]));
      this.router.navigate(newPath);
    } else {
      this.router.navigate([ConfigService.catalogId + "/" + path]);
    }
  }
}
