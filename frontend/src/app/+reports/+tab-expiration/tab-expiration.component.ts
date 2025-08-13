/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
  computed,
  EventEmitter,
  OnInit,
  signal,
} from "@angular/core";

import { MatCheckboxModule } from "@angular/material/checkbox";
import { ResearchService } from "../../+research/research.service";
import { concatMap, debounce, of, timer } from "rxjs";
import { ExpirationTableComponent } from "./expiration-table/expiration-table.component";
import { MatButtonModule } from "@angular/material/button";
import { catchError, filter, tap } from "rxjs/operators";
import { ConfigService } from "../../services/config/config.service";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { MatDividerModule } from "@angular/material/divider";
import { CatalogService } from "../../+catalog/services/catalog.service";
import { MatTabsModule } from "@angular/material/tabs";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { NavigationEnd, Router } from "@angular/router";
import { ExpiredData } from "./tab-expiration.model";
import { FormsModule } from "@angular/forms";
import { PageTemplateComponent } from "../../shared/page-template/page-template.component";

@UntilDestroy()
@Component({
  selector: "ige-tab-expiration",
  templateUrl: "./tab-expiration.component.html",
  styleUrls: ["./tab-expiration.component.scss"],
  imports: [
    MatCheckboxModule,
    ExpirationTableComponent,
    MatButtonModule,
    MatDividerModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    FormsModule,
    PageTemplateComponent,
  ],
})
export class TabExpirationComponent implements OnInit {
  currentUserId: number;
  expiryFunctionalityActive = signal<boolean>(false);

  isSearching = signal<boolean>(false);
  onSearch = new EventEmitter<void>();

  isFiltered = signal<boolean>(false);
  expiredData = signal<ExpiredData>(undefined);

  showData = computed(() => {
    if (this.isFiltered() && this.currentUserId != undefined) {
      return this.expiredData()?.filterById(this.currentUserId);
    } else {
      return this.expiredData();
    }
  });

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
        tap(() => this.isSearching.set(true)),
        debounce(() => timer(500)),
        concatMap(() => this.updateResult()),
        tap(() => this.isSearching.set(false)),
      )
      .subscribe();
  }

  private initConfigs() {
    this.catalogService
      .getExpiryDuration()
      .pipe(
        untilDestroyed(this),
        tap((expiryDuration) =>
          this.expiryFunctionalityActive.set(expiryDuration > 0),
        ),
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
    if (!this.expiryFunctionalityActive()) return of();

    return this.researchService.getExpiredDatasetStatistics().pipe(
      tap((expiredData) => this.expiredData.set(expiredData)),
      catchError((error) => this.updateOnError(error)),
    );
  }

  toggleFilter() {
    this.isFiltered.set(!this.isFiltered());
  }

  private updateOnError(error: any) {
    console.warn("Error during search", error);
    return of(new ExpiredData([], []));
  }
}
