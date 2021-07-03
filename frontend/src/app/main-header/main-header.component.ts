import { Component, OnInit } from "@angular/core";
import { ApiService } from "../services/ApiService";
import {
  ConfigService,
  UserInfo,
  Version,
} from "../services/config/config.service";
import { NavigationEnd, Router } from "@angular/router";
import { SessionQuery } from "../store/session.query";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Component({
  selector: "ige-main-header",
  templateUrl: "./main-header.component.html",
  styleUrls: ["./main-header.component.scss"],
})
export class MainHeaderComponent implements OnInit {
  userInfo$ = this.configService.$userInfo;
  showShadow: boolean;
  pageTitle: string;
  currentCatalog$: Observable<string>;
  version: Version;
  timeout$ = this.session.select("sessionTimeoutIn");
  initials: string;

  constructor(
    private apiService: ApiService,
    private configService: ConfigService,
    private session: SessionQuery,
    private router: Router
  ) {}

  ngOnInit() {
    let userInfo = this.configService.$userInfo.getValue();
    this.version = userInfo.version;
    this.initials = this.getInitials(userInfo);
    this.currentCatalog$ = this.configService.$userInfo.pipe(
      map((userInfo) => userInfo.currentCatalog.label)
    );

    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        this.showShadow = this.router.url !== "/dashboard";
        this.pageTitle = this.getPageTitleFromRoute(this.router.url);
      }
    });
  }

  logout() {
    this.apiService.logout().subscribe(() => {
      window.location.reload(true);
    });
  }

  getInitials(user: UserInfo) {
    const initials = (user.firstName[0] ?? "") + (user.lastName[0] ?? "");
    return initials.length === 0 ? "??" : initials;
  }

  userIsCatAdmin() {
    return this.userInfo$.pipe(
      map((userInfo) => {
        // TODO change when roles are fully implemented. Right now everybody is cat-admin
        return true;
        // return userInfo.roles.includes("cat-admin")
      })
    );
  }

  private getPageTitleFromRoute(url: string) {
    const firstPart = url.split(";")[0].substring(1);

    return (
      this.router.config.find((route) => route.path === firstPart)?.data
        ?.title ?? ""
    );
  }
}
