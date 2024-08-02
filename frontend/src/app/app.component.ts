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
import {
  Component,
  HostListener,
  Inject,
  OnInit,
  ViewContainerRef,
} from "@angular/core";
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer, Title } from "@angular/platform-browser";
import { BehaviourService } from "./services/behavior/behaviour.service";
import { CodelistService } from "./services/codelist/codelist.service";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { throttleTime } from "rxjs/operators";
import { AuthenticationFactory } from "./security/auth.factory";
import { combineLatest, Subject } from "rxjs";
import { ConfigService } from "./services/config/config.service";
import { ProfileService } from "./services/profile.service";
import { PluginToken } from "./tokens/plugin.token";
import { Plugin } from "./+catalog/+behaviours/plugin";
import { NavigationEnd, Router } from "@angular/router";
import { TranslocoService } from "@ngneat/transloco";

@UntilDestroy()
@Component({
  selector: "ige-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  sessionRefresher$ = new Subject<void>();
  favIcon: HTMLLinkElement = document.querySelector("#appIcon");
  showTestBadge: boolean;

  isLoggingout = false;

  constructor(
    private behaviourService: BehaviourService /*for initialization!*/,
    private configService: ConfigService,
    codelistService: CodelistService,
    private registry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private authFactory: AuthenticationFactory,
    private titleService: Title,
    private profileService: ProfileService,
    private viewContainerRef: ViewContainerRef,
    @Inject(PluginToken) private autoPlugins: Plugin[],
    private router: Router,
    private transloco: TranslocoService,
  ) {
    this.loadProfile();

    this.loadIcons();

    // TODO: requested codelists by document types are stored in codelist store, however catalog codelists
    //       are found in a separate part. Moreover when opening the codelist admin page, all codelists are
    //       loaded and replaced in store overwriting catalog codelists
    //       Catalog Codelists should be loaded initially into the correct store!
    codelistService.fetchCatalogCodelists();

    this.showTestBadge =
      this.configService.getConfiguration().featureFlags?.showTestBadge;
    if (this.showTestBadge)
      titleService.setTitle(titleService.getTitle() + " TEST");
  }

  private loadIcons() {
    // useful tool for merging SVG files: merge-svg-files via npm
    this.registry.addSvgIconSet(
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        "assets/icons/icon-navigation.svg",
      ),
    );
    this.registry.addSvgIconSet(
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        "assets/icons/icon-doc-types.svg",
      ),
    );
    this.registry.addSvgIconSet(
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        "assets/icons/icon-toolbar.svg",
      ),
    );
    this.registry.addSvgIconSet(
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        "assets/icons/icon-general.svg",
      ),
    );
    this.registry.addSvgIconSet(
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        "assets/icons/icon-button.svg",
      ),
    );
    this.registry.addSvgIconSet(
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        "assets/images/banner.svg",
      ),
    );
  }

  private loadProfile() {
    this.profileService.initProfile().subscribe((componentType) => {
      this.viewContainerRef.createComponent(componentType);
    });
  }

  @HostListener("click")
  updateSession() {
    this.sessionRefresher$.next();
  }

  ngOnInit() {
    this.sessionRefresher$
      .pipe(
        untilDestroyed(this),
        throttleTime(10000), // allow token refresh only every 10s once
      )
      .subscribe(() => this.authFactory.get().refreshToken());

    combineLatest([
      this.transloco.selectTranslation(),
      this.router.events,
    ]).subscribe(([_, event]) => {
      if (event instanceof NavigationEnd) {
        const mainTitle = this.transloco.translate("pageTitle.default");
        const splittedByParams = this.router.url.split(";");
        const mappedPath = splittedByParams[0].split("/").slice(2).join(".");
        const key = `pageTitle.${mappedPath}`;
        const pageTitle = this.transloco.translate(key);
        let newTitle = mainTitle;
        if (key !== pageTitle) {
          newTitle = pageTitle + " | " + mainTitle;
        }
        this.titleService.setTitle(newTitle);
        this.favIcon.href = this.transloco.translate("pageTitle.favIcon");
      }
    });
  }
}
