import { Component, EventEmitter, OnInit } from "@angular/core";
import { PageTemplateModule } from "../../shared/page-template/page-template.module";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { ResearchResponse, ResearchService } from "../research.service";
import { combineLatestWith, concatMap, debounce, of, timer } from "rxjs";
import { ExpirationTableComponent } from "./expiration-table/expiration-table.component";
import { MatButtonModule } from "@angular/material/button";
import { catchError, filter, map, tap } from "rxjs/operators";
import { ConfigService } from "../../services/config/config.service";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { NgIf } from "@angular/common";
import { MatDividerModule } from "@angular/material/divider";
import { CatalogService } from "../../+catalog/services/catalog.service";
import { UserService } from "../../services/user/user.service";
import { FrontendUser } from "../../+user/user";
import { MatTabsModule } from "@angular/material/tabs";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { NavigationEnd, Router } from "@angular/router";

@UntilDestroy()
@Component({
  selector: "ige-tab-expiration",
  templateUrl: "./tab-expiration.component.html",
  styleUrls: ["./tab-expiration.component.scss"],
  standalone: true,
  imports: [
    PageTemplateModule,
    MatCheckboxModule,
    ExpirationTableComponent,
    MatButtonModule,
    NgIf,
    MatDividerModule,
    MatTabsModule,
    MatProgressSpinnerModule,
  ],
})
export class TabExpirationComponent implements OnInit {
  currentUser: FrontendUser;
  expiryDurationInDays: number;

  isSearching: boolean = false;
  filterUserId: number;
  onSearch = new EventEmitter<void>();

  totalHits: number;
  objects: ResearchResponse;
  addresses: ResearchResponse;

  constructor(
    private researchService: ResearchService,
    private configService: ConfigService,
    private catalogService: CatalogService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initSearchEmitter();
    this.initConfigs();
    this.initAutoSearch();
  }

  private initSearchEmitter() {
    this.onSearch
      .pipe(
        untilDestroyed(this),
        tap(() => (this.isSearching = true)),
        debounce(() => timer(500)),
        concatMap(() => this.updateResult()),
        tap(() => (this.isSearching = false))
      )
      .subscribe();
  }

  private initConfigs() {
    this.configService.$userInfo
      .pipe(
        untilDestroyed(this),
        map((userInfo) =>
          this.userService.users$.value.find(
            (user) => user.login == userInfo.userId
          )
        ),
        tap((user) => (this.currentUser = user))
      )
      .subscribe();
    this.catalogService
      .getConfig()
      .pipe(
        untilDestroyed(this),
        map((config) => config.expiryDuration),
        tap((expiryDuration) => (this.expiryDurationInDays = expiryDuration)),
        tap(() => this.onSearch.emit())
      )
      .subscribe();
  }

  private initAutoSearch() {
    this.router.events
      .pipe(
        untilDestroyed(this),
        filter(
          (event) =>
            event instanceof NavigationEnd &&
            event.url.includes("research/expiration")
        ),
        tap(() => this.onSearch.emit())
      )
      .subscribe();
  }

  private updateResult() {
    if (!this.expiryDurationInDays) return of();

    return this.search("selectDocuments").pipe(
      combineLatestWith(this.search("selectAddresses")),
      map(([objects, addresses]) => {
        this.objects = objects;
        this.addresses = addresses;
        this.totalHits =
          (objects?.totalHits ?? 0) + (addresses?.totalHits ?? 0);
      })
    );
  }

  private search(type: string) {
    return this.researchService.search("", { type }).pipe(
      catchError((error) => this.updateOnError(error)),
      map((res) => this.filterByExpiry(res))
    );
  }

  private filterByExpiry(res: ResearchResponse): ResearchResponse {
    const filtered = res.hits.filter((doc) => {
      const expiryDuration = 1000 * 60 * 60 * 24 * this.expiryDurationInDays;
      const modifiedTime = new Date(doc._contentModified).getTime();
      const expiryTime = modifiedTime + expiryDuration;
      return Date.now() > expiryTime;
    });
    return { totalHits: filtered.length, hits: filtered };
  }

  toggleFilter(val: boolean) {
    this.filterUserId = val ? this.currentUser?.id : undefined;
  }

  private updateOnError(error) {
    console.warn("Error during search", error);
    return of({ totalHits: 0, hits: [] });
  }
}
