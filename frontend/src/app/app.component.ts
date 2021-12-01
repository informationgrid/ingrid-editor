import { Component, HostListener, OnInit } from "@angular/core";
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { BehaviourService } from "./services/behavior/behaviour.service";
import { CodelistService } from "./services/codelist/codelist.service";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { throttleTime } from "rxjs/operators";
import { AuthenticationFactory } from "./security/auth.factory";
import { Subject } from "rxjs";

@UntilDestroy()
@Component({
  selector: "ige-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  sessionRefresher$ = new Subject();

  constructor(
    private behaviourService: BehaviourService /*for initialization!*/,
    private codelistService: CodelistService,
    registry: MatIconRegistry,
    domSanitizer: DomSanitizer,
    private authFactory: AuthenticationFactory
  ) {
    // TODO: get RoleMapping from each role so that we can give permissions in client correctly
    /*this.roleService.getGroup('admin')
      .subscribe(role => {
        console.log('my roles:', role);
      });*/

    // useful tool for merging SVG files: merge-svg-files via npm
    registry.addSvgIconSet(
      domSanitizer.bypassSecurityTrustResourceUrl(
        "assets/icons/icon-navigation.svg"
      )
    );
    registry.addSvgIconSet(
      domSanitizer.bypassSecurityTrustResourceUrl(
        "assets/icons/icon-doc-types.svg"
      )
    );
    registry.addSvgIconSet(
      domSanitizer.bypassSecurityTrustResourceUrl(
        "assets/icons/icon-toolbar.svg"
      )
    );
    registry.addSvgIconSet(
      domSanitizer.bypassSecurityTrustResourceUrl(
        "assets/icons/icon-general.svg"
      )
    );
    registry.addSvgIconSet(
      domSanitizer.bypassSecurityTrustResourceUrl(
        "assets/icons/icon-button.svg"
      )
    );
    registry.addSvgIconSet(
      domSanitizer.bypassSecurityTrustResourceUrl("assets/images/banner.svg")
    );

    // TODO: requested codelists by document types are stored in codelist store, however catalog codelists
    //       are found in a separate part. Moreover when opening the codelist admin page, all codelists are
    //       loaded and replaced in store overwriting catalog codelists
    //       Catalog Codelists should be loaded initially into the correct store!
    codelistService.fetchCatalogCodelists();
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
