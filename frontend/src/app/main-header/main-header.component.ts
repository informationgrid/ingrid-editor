import { Component, OnInit } from "@angular/core";
import {
  ConfigService,
  UserInfo,
  Version,
} from "../services/config/config.service";
import { NavigationEnd, Router } from "@angular/router";
import { SessionQuery } from "../store/session.query";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { StorageService } from "../../storage.service";
import { AuthenticationFactory } from "../security/auth.factory";

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
  isAdmin: boolean;
  externalHelp: string;

  constructor(
    private configService: ConfigService,
    private session: SessionQuery,
    private router: Router,
    private authFactory: AuthenticationFactory,
    private storageService: StorageService
  ) {}

  ngOnInit() {
    let userInfo = this.configService.$userInfo.getValue();
    this.isAdmin = this.configService.isAdmin();
    this.version = userInfo?.version;
    this.externalHelp = userInfo?.externalHelp;
    console.log("ExternalHelp: " + this.externalHelp);
    console.log(userInfo);
    this.initials = this.getInitials(userInfo);
    this.currentCatalog$ = this.configService.$userInfo.pipe(
      map((userInfo) => userInfo?.currentCatalog?.label)
    );

    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        this.showShadow = this.router.url !== "/dashboard";
        this.pageTitle = this.getPageTitleFromRoute(this.router.url);
      }
    });
  }

  logout() {
    this.storageService.clear("ige-refresh-token");
    this.authFactory.get().logout();
  }

  getInitials(user: UserInfo) {
    const initials = (user?.firstName[0] ?? "") + (user?.lastName[0] ?? "");
    return initials.length === 0 ? "??" : initials;
  }

  private getPageTitleFromRoute(url: string) {
    const firstPart = url.split(";")[0].substring(1);

    return (
      this.router.config.find((route) => route.path === firstPart)?.data
        ?.title ?? ""
    );
  }

  openProfileSettings() {
    this.router.navigate(["/profile"]);
  }
}
