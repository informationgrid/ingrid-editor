/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import {
  ConfigService,
  Configuration,
  UserInfo,
  Version,
} from "../services/config/config.service";
import { NavigationEnd, Router, RouterLink, Routes } from "@angular/router";
import { SessionQuery } from "../store/session.query";
import { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";
import { StorageService } from "../../storage.service";
import { AuthenticationFactory } from "../security/auth.factory";
import { CatalogService } from "../+catalog/services/catalog.service";
import { default as settingsRoutes } from "../+settings/routes";
import { FormMenuService, FormularMenuItem } from "../+form/form-menu.service";
import { TranslocoDirective } from "@ngneat/transloco";
import { MatToolbar, MatToolbarRow } from "@angular/material/toolbar";
import { SessionTimeoutInfoComponent } from "./session-timeout-info/session-timeout-info.component";
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatTooltip } from "@angular/material/tooltip";
import { MatMenu, MatMenuItem, MatMenuTrigger } from "@angular/material/menu";
import { MatIcon } from "@angular/material/icon";
import { MatCardTitle } from "@angular/material/card";
import { MatDivider } from "@angular/material/divider";
import { AsyncPipe, DatePipe } from "@angular/common";

@Component({
  selector: "ige-main-header",
  templateUrl: "./main-header.component.html",
  styleUrls: ["./main-header.component.scss"],
  standalone: true,
  imports: [
    TranslocoDirective,
    MatToolbar,
    MatToolbarRow,
    SessionTimeoutInfoComponent,
    MatButton,
    MatTooltip,
    MatMenuTrigger,
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatIconButton,
    MatCardTitle,
    MatDivider,
    RouterLink,
    AsyncPipe,
    DatePipe,
  ],
})
export class MainHeaderComponent implements OnInit {
  @Output() onLogout = new EventEmitter<void>();

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
  menuItems: Routes = settingsRoutes[0].children
    .filter((item) => item.path !== "")
    .filter((item) => this.configService.hasPermission(item.data?.permission));
  menuInfos: FormularMenuItem[] = this.formMenuService.getMenuItems("settings");

  constructor(
    private configService: ConfigService,
    private catalogService: CatalogService,
    private session: SessionQuery,
    private router: Router,
    private authFactory: AuthenticationFactory,
    private storageService: StorageService,
    private formMenuService: FormMenuService,
  ) {}

  ngOnInit() {
    let userInfo = this.configService.$userInfo.getValue();
    this.isAdmin = this.configService.hasCatAdminRights();
    this.version = userInfo?.version;
    this.externalHelp = userInfo?.externalHelp;
    this.catalogId = userInfo?.currentCatalog.id;
    this.initials = this.getInitials(userInfo);
    this.currentCatalog$ = this.configService.$userInfo.pipe(
      tap(
        (userInfo) =>
          (this.otherAssignedCatalogs =
            this.getOtherAssignedCatalogs(userInfo)),
      ),
      map((userInfo) => userInfo?.currentCatalog?.label),
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
    const hasNavigated = await this.router.navigate(
      [`${ConfigService.catalogId}/logout`],
      { skipLocationChange: true },
    );

    if (!hasNavigated) {
      return;
    }

    this.onLogout.emit();

    setTimeout(() => {
      this.storageService.clear("ige-refresh-token");
      this.authFactory.get().logout();
    }, 1000);
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
