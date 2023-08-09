import { Component, EventEmitter, OnInit } from "@angular/core";
import { PageTemplateModule } from "../../shared/page-template/page-template.module";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { ResearchResponse, ResearchService } from "../research.service";
import {
  BehaviorSubject,
  combineLatest,
  combineLatestWith,
  concatMap,
  debounce,
  of,
  timer,
} from "rxjs";
import { ExpirationTableComponent } from "./expiration-table/expiration-table.component";
import { MatButtonModule } from "@angular/material/button";
import { catchError, filter, map, tap } from "rxjs/operators";
import { ConfigService } from "../../services/config/config.service";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { AsyncPipe, NgIf, NgTemplateOutlet } from "@angular/common";
import { MatDividerModule } from "@angular/material/divider";
import { CatalogService } from "../../+catalog/services/catalog.service";
import { MatTabsModule } from "@angular/material/tabs";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { NavigationEnd, Router } from "@angular/router";
import { UserDataService } from "../../services/user/user-data.service";
import { ExpiredData } from "./tab-expiration.model";
import { FormsModule } from "@angular/forms";
import { isExpired } from "../../services/utils";

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
    AsyncPipe,
    NgTemplateOutlet,
    FormsModule,
  ],
})
export class TabExpirationComponent implements OnInit {
  currentUserId: number;
  expiryDurationInDays: number;

  isSearching: boolean = false;
  onSearch = new EventEmitter<void>();

  isFiltered$ = new BehaviorSubject<boolean>(false);
  expiredData$ = new BehaviorSubject<ExpiredData>(undefined);
  shownData = combineLatest([this.expiredData$, this.isFiltered$]).pipe(
    map(() => this.getShownData())
  );

  constructor(
    private researchService: ResearchService,
    private configService: ConfigService,
    private catalogService: CatalogService,
    private userDataService: UserDataService,
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
        tap((info) => (this.currentUserId = info.id))
      )
      .subscribe();
    this.catalogService
      .getExpiryDuration()
      .pipe(
        untilDestroyed(this),
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
            event.url.includes("reports/expiration")
        ),
        tap(() => this.onSearch.emit())
      )
      .subscribe();
  }

  private updateResult() {
    if (!this.expiryDurationInDays) return of();

    return this.search("selectDocuments").pipe(
      combineLatestWith(this.search("selectAddresses")),
      map(([objects, addresses]) =>
        this.expiredData$.next(new ExpiredData(objects.hits, addresses.hits))
      )
    );
  }

  private search(type: string) {
    return this.researchService
      .search("", {
        type: type,
        ignoreFolders: "exceptFolders",
        selectOnlyPublished: "document1.state = 'PUBLISHED'",
      })
      .pipe(
        catchError((error) => this.updateOnError(error)),
        map((res) => this.filterByExpiry(res))
      );
  }

  private filterByExpiry(res: ResearchResponse): ResearchResponse {
    const filtered = res.hits.filter((doc) =>
      isExpired(doc._contentModified, this.expiryDurationInDays)
    );
    return { totalHits: filtered.length, hits: filtered };
  }

  getShownData(): ExpiredData {
    if (this.isFiltered$.value && this.currentUserId != undefined) {
      return this.expiredData$.value?.filterById(this.currentUserId);
    } else {
      return this.expiredData$.value;
    }
  }

  toggleFilter() {
    this.isFiltered$.next(!this.isFiltered$.value);
  }

  private updateOnError(error) {
    console.warn("Error during search", error);
    return of({ totalHits: 0, hits: [] });
  }
}
