import { Component, OnInit } from "@angular/core";
import {
  ConfigService,
  Configuration,
  UserInfo,
  Version,
} from "../services/config/config.service";
import { NavigationEnd, Router, Routes } from "@angular/router";
import { SessionQuery } from "../store/session.query";
import { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";
import { StorageService } from "../../storage.service";
import { AuthenticationFactory } from "../security/auth.factory";
import { CatalogService } from "../+catalog/services/catalog.service";
import { settingsRoutes } from "../+settings/settings.routing";
import { FormMenuService, FormularMenuItem } from "../+form/form-menu.service";

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
  config: Configuration;
  otherAssignedCatalogs: any[];
  catalogId: string;
  menuItems: Routes = settingsRoutes[0].children.filter(
    (item) => item.path !== ""
  );
  menuInfos: FormularMenuItem[] = this.formMenuService.getMenuItems("settings");

  constructor(
    private configService: ConfigService,
    private catalogService: CatalogService,
    private session: SessionQuery,
    private router: Router,
    private authFactory: AuthenticationFactory,
    private storageService: StorageService,
    private formMenuService: FormMenuService
  ) {}

  ngOnInit() {
    let userInfo = this.configService.$userInfo.getValue();
    this.isAdmin = this.configService.isAdmin();
    this.version = userInfo?.version;
    this.externalHelp = userInfo?.externalHelp;
    this.catalogId = userInfo?.currentCatalog.id;
    this.initials = this.getInitials(userInfo);
    this.currentCatalog$ = this.configService.$userInfo.pipe(
      tap(
        (userInfo) =>
          (this.otherAssignedCatalogs = this.getOtherAssignedCatalogs(userInfo))
      ),
      map((userInfo) => userInfo?.currentCatalog?.label)
    );

    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        const rootPath = this.router.parseUrl(this.router.url).root.children
          .primary?.segments[1]?.path;
        this.showShadow = rootPath !== "dashboard";
        this.pageTitle = rootPath;
      }
    });
    this.config = this.configService.getConfiguration();
  }

  private getOtherAssignedCatalogs(userInfo: UserInfo) {
    return (
      userInfo?.assignedCatalogs
        ?.filter((c) => c.id !== userInfo.currentCatalog?.id)
        .sort((a, b) => a.name.localeCompare(b.name)) ?? []
    );
  }

  async logout() {
    const hasNavigated = await this.router.navigate([
      `${ConfigService.catalogId}`,
    ]);
    if (!hasNavigated) return;
    this.storageService.clear("ige-refresh-token");
    this.authFactory.get().logout();
  }

  getInitials(user: UserInfo) {
    const initials = (user?.firstName[0] ?? "") + (user?.lastName[0] ?? "");
    return initials.length === 0 ? "??" : initials;
  }

  openProfileSettings() {
    this.router.navigate([`/${this.catalogId}/profile`]);
  }

  chooseCatalog(id: string) {
    this.catalogService.switchCatalog(id);
  }
}
