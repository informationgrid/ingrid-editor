import { Component, OnInit } from "@angular/core";
import {
  ConfigService,
  UserInfo,
  Version,
} from "../services/config/config.service";
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  NavigationEnd,
  Router,
} from "@angular/router";
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
    private storageService: StorageService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    let userInfo = this.configService.$userInfo.getValue();
    this.isAdmin = this.configService.isAdmin();
    this.version = userInfo?.version;
    this.externalHelp = userInfo?.externalHelp;
    this.initials = this.getInitials(userInfo);
    this.currentCatalog$ = this.configService.$userInfo.pipe(
      map((userInfo) => userInfo?.currentCatalog?.label)
    );

    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        this.showShadow = this.router.url !== "/dashboard";
        let firstChild = this.route.snapshot.firstChild;
        this.pageTitle = this.getTitleFromDeepestChild(firstChild);
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

  openProfileSettings() {
    this.router.navigate(["/profile"]);
  }

  private getTitleFromDeepestChild(child: ActivatedRouteSnapshot): string {
    if (child.children.length > 0)
      return this.getTitleFromDeepestChild(child.firstChild);
    return child.data.title;
  }
}
