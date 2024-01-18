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
import { Component, EventEmitter, OnInit } from "@angular/core";
import { PageTemplateModule } from "../../shared/page-template/page-template.module";
import { MatCheckboxModule } from "@angular/material/checkbox";
import {
  ResearchResponse,
  ResearchService,
} from "../../+research/research.service";
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
import { AsyncPipe, NgTemplateOutlet } from "@angular/common";
import { MatDividerModule } from "@angular/material/divider";
import { CatalogService } from "../../+catalog/services/catalog.service";
import { MatTabsModule } from "@angular/material/tabs";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { NavigationEnd, Router } from "@angular/router";
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
    map(() => this.getShownData()),
  );

  constructor(
    private researchService: ResearchService,
    private configService: ConfigService,
    private catalogService: CatalogService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.configService.$userInfo?.getValue().id;
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
        tap(() => (this.isSearching = false)),
      )
      .subscribe();
  }

  private initConfigs() {
    this.catalogService
      .getExpiryDuration()
      .pipe(
        untilDestroyed(this),
        tap((expiryDuration) => (this.expiryDurationInDays = expiryDuration)),
        tap(() => this.onSearch.emit()),
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
            event.url.includes("reports/expiration"),
        ),
        tap(() => this.onSearch.emit()),
      )
      .subscribe();
  }

  private updateResult() {
    if (!this.expiryDurationInDays) return of();

    return this.search("selectDocuments").pipe(
      combineLatestWith(this.search("selectAddresses")),
      map(([objects, addresses]) =>
        this.expiredData$.next(new ExpiredData(objects.hits, addresses.hits)),
      ),
    );
  }

  private search(type: string) {
    return this.researchService
      .search(
        "",
        {
          type: type,
          state: { exceptFolders: true },
          selectOnlyPublished: "document1.state = 'PUBLISHED'",
        },
        "contentmodified",
        "ASC",
        undefined,
        ["selectOnlyPublished"],
      )
      .pipe(
        catchError((error) => this.updateOnError(error)),
        map((res) => this.filterByExpiry(res)),
      );
  }

  private filterByExpiry(res: ResearchResponse): ResearchResponse {
    const filtered = res.hits.filter((doc) =>
      isExpired(doc._contentModified, this.expiryDurationInDays),
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

  private updateOnError(error: any) {
    console.warn("Error during search", error);
    return of({ totalHits: 0, hits: [] });
  }
}
