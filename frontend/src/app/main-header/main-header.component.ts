/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  output,
  signal,
} from "@angular/core";
import {
  ConfigService,
  UserInfo,
  Version,
} from "../services/config/config.service";
import { NavigationEnd, Router, RouterLink, Routes } from "@angular/router";
import { StorageService } from "../../storage.service";
import { AuthenticationFactory } from "../security/auth.factory";
import { CatalogService } from "../+catalog/services/catalog.service";
import { default as settingsRoutes } from "../+settings/routes";
import { FormMenuService, FormularMenuItem } from "../+form/form-menu.service";
import { TranslocoDirective, TranslocoService } from "@jsverse/transloco";
import { MatToolbar, MatToolbarRow } from "@angular/material/toolbar";
import { SessionTimeoutInfoComponent } from "./session-timeout-info/session-timeout-info.component";
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatTooltip } from "@angular/material/tooltip";
import { MatMenu, MatMenuItem, MatMenuTrigger } from "@angular/material/menu";
import { MatIcon } from "@angular/material/icon";
import { MatCardTitle } from "@angular/material/card";
import { MatDivider } from "@angular/material/divider";
import { DatePipe } from "@angular/common";
import { GeneralStore } from "../store/general.store";
import { MatomoTrackClickDirective } from "ngx-matomo-client";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";

@Component({
  selector: "ige-main-header",
  templateUrl: "./main-header.component.html",
  styleUrls: ["./main-header.component.scss"],
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
    DatePipe,
    MatomoTrackClickDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainHeaderComponent implements OnInit {
  private generalStore = inject(GeneralStore);
  private configService = inject(ConfigService);
  private catalogService = inject(CatalogService);
  private router = inject(Router);
  private authFactory = inject(AuthenticationFactory);
  private storageService = inject(StorageService);
  private formMenuService = inject(FormMenuService);
  private translocoService = inject(TranslocoService);
  readonly onLogout = output<void>();

  showShadow = signal<boolean>(false);
  pageTitle = signal<string>("");
  userInfo = toSignal(this.configService.$userInfo);
  currentCatalog$ = computed(() => this.userInfo().currentCatalog?.label);

  version = signal<Version>(null);
  timeout = this.generalStore.sessionTimeoutIn;
  initials = computed(() => this.getInitials(this.userInfo()));
  isAdmin = signal<boolean>(false);
  otherAssignedCatalogs = computed(() =>
    this.getOtherAssignedCatalogs(this.userInfo()),
  );
  catalogId = computed(() => this.userInfo()?.currentCatalog.id);
  menuItems: Routes = settingsRoutes[0].children
    .filter((item) => item.path !== "")
    .filter((item) => this.configService.hasPermission(item.data?.permission));
  menuInfos: FormularMenuItem[] = this.formMenuService.getMenuItems("settings");

  constructor() {
    this.router.events.pipe(takeUntilDestroyed()).subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        const rootPath = this.router.parseUrl(this.router.url).root.children
          .primary?.segments[1]?.path;
        this.showShadow.set(rootPath !== "dashboard");
        this.pageTitle.set(this.translocoService.translate(`menu.${rootPath}`));
      }
    });
  }

  ngOnInit() {
    let userInfo = this.configService.$userInfo.getValue();
    this.isAdmin.set(this.configService.hasCatAdminRights());
    this.version.set(userInfo?.version);
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

    // TODO: The 'emit' function requires a mandatory void argument
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
    this.router.navigate([`/${this.catalogId()}/profile`]);
  }

  chooseCatalog(id: string) {
    this.catalogService.switchCatalog(id);
  }
}
