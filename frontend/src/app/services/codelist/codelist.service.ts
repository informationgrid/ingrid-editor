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
import { Injectable } from "@angular/core";
import { CodelistDataService } from "./codelist-data.service";
import {
  BackendOption,
  Codelist,
  CodelistBackend,
  CodelistEntry,
  CodelistEntryBackend,
} from "../../store/codelist/codelist.model";
import { CodelistStore } from "../../store/codelist/codelist.store";
import { Observable, Subject } from "rxjs";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { distinct, filter, map, switchMap, tap } from "rxjs/operators";
import { CodelistQuery } from "../../store/codelist/codelist.query";
import { ConfigService } from "../config/config.service";

export class SelectOption {
  label: string;
  value: string;

  static fromBackend(option: BackendOption): SelectOption {
    return option ? new SelectOption(option.key, option.value) : null;
  }

  constructor(value: string, label: string) {
    this.value = value;
    this.label = label;
  }

  forBackend(): BackendOption {
    if (this.value === null || this.value === undefined) {
      return {
        key: null,
        value: this.label,
      };
    } else {
      return {
        key: this.value,
      };
    }
  }
}

export interface SelectOptionUi extends SelectOption {
  disabled?: boolean;
}

@UntilDestroy()
@Injectable({
  providedIn: "root",
})
export class CodelistService {
  private requestedCodelists = new Subject<string[]>();

  static mapToSelect = (
    codelist: Codelist,
    language = "de",
    sort = true,
  ): SelectOptionUi[] => {
    if (!codelist) {
      return [];
    }

    const items = codelist.entries.map(
      (entry) =>
        ({
          label: entry.fields[language] ?? entry.fields["name"],
          value: entry.id,
        }) as SelectOptionUi,
    );

    return sort
      ? CodelistService.sortFavorites(
          codelist.id,
          items.sort((a, b) => a.label?.localeCompare(b.label)),
        )
      : items;
  };

  private queue = [];
  private batchProcessed = true;

  constructor(
    private store: CodelistStore,
    protected codelistQuery: CodelistQuery,
    private dataService: CodelistDataService,
  ) {
    this.requestedCodelists
      .pipe(
        untilDestroyed(this),
        // ignore multiple same ids
        distinct(),
        filter((ids) => ids.length > 0),
        switchMap((ids) => this.requestCodelists(ids)),
        map((codelists) => this.prepareCodelists(codelists)),
        tap((codelists) => this.store.add(codelists)),
        tap(() => (this.batchProcessed = true)),
      )
      .subscribe();
  }

  byId(id: string): void {
    if (this.queue.indexOf(id) !== -1) return;

    this.queue.push(id);

    if (!this.batchProcessed) return;

    const interval = setInterval(() => {
      if (this.batchProcessed && this.queue.length > 0) {
        this.batchProcessed = false;
        this.requestedCodelists.next([...this.queue]);
        this.queue = [];
      }
      if (this.queue.length === 0) {
        clearInterval(interval);
      }
    }, 100);
  }

  update(): Observable<Codelist[]> {
    return this.dataService.update().pipe(
      map((codelists) => this.prepareCodelists(codelists, true)),
      tap((codelists) => this.store.set(codelists)),
    );
  }

  private requestCodelists(ids: string[]): Observable<CodelistBackend[]> {
    return this.dataService.byIds(ids);
  }

  private prepareCodelists(
    codelists: CodelistBackend[],
    isCatalog: boolean = false,
  ): Codelist[] {
    return codelists.map((codelist) => ({
      id: codelist.id,
      name: codelist.name,
      description: codelist.description,
      entries: this.prepareEntries(codelist.entries),
      default: codelist.defaultEntry,
      isCatalog: isCatalog,
    }));
  }

  private prepareEntries(entries: CodelistEntryBackend[]): CodelistEntry[] {
    return entries.map((entry) => ({
      id: entry.id,
      description: entry.description,
      fields: entry.localisations,
      data: entry.data,
    }));
  }

  getAll() {
    this.dataService
      .getAll()
      .pipe(
        map((codelists) => this.prepareCodelists(codelists)),
        tap((codelists) => this.store.set(codelists)),
      )
      .subscribe();
  }

  mapToOptions(codelists: Codelist[]): SelectOptionUi[] {
    return codelists
      .map((cl) => new SelectOption(cl.id, cl.name))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  fetchCatalogCodelists(): void {
    this.dataService
      .getCatalogCodelists()
      .pipe(
        map((codelists) => this.prepareCodelists(codelists, true)),
        tap((codelists) => this.store.add(codelists, { loading: true })),
      )
      .subscribe();
  }

  updateCodelist(codelist: Codelist): Observable<any> {
    const backendCodelist = this.prepareForBackend(codelist);
    return this.dataService
      .updateCodelist(backendCodelist)
      .pipe(tap(() => this.store.update(codelist)));
  }

  private prepareForBackend(codelist: Codelist): CodelistBackend {
    return {
      id: codelist.id,
      name: codelist.name,
      description: codelist.description,
      entries: this.prepareEntriesForBackend(codelist.entries),
      defaultEntry: codelist.default,
    };
  }

  private prepareEntriesForBackend(
    entries: CodelistEntry[],
  ): CodelistEntryBackend[] {
    return entries.map((entry) => ({
      id: entry.id,
      description: entry.description,
      data: entry.data,
      localisations: entry.fields,
    }));
  }

  resetCodelist(id: string) {
    return this.dataService.resetCodelist(id).pipe(
      map((codelists) => this.prepareCodelists(codelists, true)),
      tap((codelists) => this.store.add(codelists)),
    );
  }

  observe(
    codelistId: string,
    sort: boolean = true,
  ): Observable<SelectOptionUi[]> {
    return this.observeRaw(codelistId).pipe(
      map((codelist) => CodelistService.mapToSelect(codelist, "de", sort)),
    );
  }

  observeRaw(codelistId: string): Observable<Codelist> {
    const alreadyInQueue = this.queue.some((item) => item === codelistId);
    const alreadyInStore = this.codelistQuery.getEntity(codelistId);

    if (!alreadyInQueue && !alreadyInStore) {
      this.byId(codelistId);
    }

    return this.codelistQuery.selectEntity(codelistId).pipe(
      filter((codelist) => !!codelist),
      // take(1), // if we complete observable then we cannot modify catalog codelist and see change immediately
    );
  }

  static sortFavorites(
    codelistId: string,
    sortedItems: SelectOptionUi[],
  ): SelectOptionUi[] {
    const favorites: string[] =
      ConfigService.codelistFavorites?.[codelistId] ?? [];
    if (favorites.length === 0) return sortedItems;

    const favoriteItems = favorites
      .map((item) => sortedItems.find((it) => it.value === item))
      .filter((item) => item);

    if (favoriteItems.length > 0) {
      const separator: SelectOptionUi = new SelectOption(
        "_SEPARATOR_",
        "-----",
      );
      separator.disabled = true;
      favoriteItems.push(separator);
    }

    const itemsWithoutFavorites = sortedItems.filter(
      (item) => !favorites.includes(item.value),
    );

    return favoriteItems.concat(itemsWithoutFavorites);
  }

  updateFavorites(id: string, entryIds: string[]) {
    return this.dataService.updateFavorites(id, entryIds);
  }
}
