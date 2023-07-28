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
import { Subject } from "rxjs";
import { ConfigService } from "./services/config/config.service";
import { ProfileService } from "./services/profile.service";
import { FormPluginToken } from "./tokens/plugin.token";
import { Plugin } from "./+catalog/+behaviours/plugin";
import { AssignedUserBehaviour } from "./+catalog/+behaviours/system/AssignedUser/assigned-user.behaviour";

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

  constructor(
    private behaviourService: BehaviourService /*for initialization!*/,
    private configService: ConfigService,
    private codelistService: CodelistService,
    private registry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private authFactory: AuthenticationFactory,
    private titleService: Title,
    private profileService: ProfileService,
    private viewContainerRef: ViewContainerRef,
    @Inject(FormPluginToken) private autoPlugins: Plugin[],
    private assignedPlugin: AssignedUserBehaviour
  ) {
    this.loadProfile();

    this.loadIcons();

    // TODO: requested codelists by document types are stored in codelist store, however catalog codelists
    //       are found in a separate part. Moreover when opening the codelist admin page, all codelists are
    //       loaded and replaced in store overwriting catalog codelists
    //       Catalog Codelists should be loaded initially into the correct store!
    codelistService.fetchCatalogCodelists();

    // TODO: remove profile specific logic here
    const profile =
      this.configService.$userInfo.getValue().currentCatalog?.type;
    if (profile == "mcloud") {
      this.favIcon.href = "/assets/profiles/mcloud/assets/icons/favicon.ico";
      titleService.setTitle("mCLOUD Editor");
    } else if (profile == "uvp") {
      this.favIcon.href = "/assets/profiles/uvp/assets/icons/favicon.ico";
      titleService.setTitle("UVP Editor");
    } else if (profile == "bmi") {
      //this.favIcon.href = "/assets/profiles/bmi/assets/icons/favicon.ico";
      titleService.setTitle("Open Data Editor Bund");
    }

    this.showTestBadge =
      this.configService.getConfiguration().featureFlags?.showTestBadge;
    if (this.showTestBadge)
      titleService.setTitle(titleService.getTitle() + " TEST");
  }

  private loadIcons() {
    // useful tool for merging SVG files: merge-svg-files via npm
    this.registry.addSvgIconSet(
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        "assets/icons/icon-navigation.svg"
      )
    );
    this.registry.addSvgIconSet(
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        "assets/icons/icon-doc-types.svg"
      )
    );
    this.registry.addSvgIconSet(
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        "assets/icons/icon-toolbar.svg"
      )
    );
    this.registry.addSvgIconSet(
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        "assets/icons/icon-general.svg"
      )
    );
    this.registry.addSvgIconSet(
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        "assets/icons/icon-button.svg"
      )
    );
    this.registry.addSvgIconSet(
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        "assets/images/banner.svg"
      )
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
        throttleTime(10000) // allow token refresh only every 10s once
      )
      .subscribe(() => this.authFactory.get().refreshToken());
  }
}
