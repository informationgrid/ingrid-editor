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
import { effect, inject, Injectable } from "@angular/core";
import { CodelistDataService } from "./codelist-data.service";
import {
  BackendOption,
  Codelist,
  CodelistBackend,
  CodelistEntry,
  CodelistEntryBackend,
} from "../../store/codelist/codelist.model";
import {
  bufferTime,
  combineLatest,
  concatMap,
  distinct,
  Observable,
  Subject,
  throwError,
} from "rxjs";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { catchError, filter, map, tap } from "rxjs/operators";
import { HttpErrorResponse } from "@angular/common/http";
import { IgeError } from "../../models/ige-error";
import { CodelistStore } from "../../store/codelist/codelist.store";
import { toObservable } from "@angular/core/rxjs-interop";
import { GeneralStore } from "../../store/general.store";

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
  sortkey?: CodelistSort;
}

export type CodelistSort =
  | "NO_SORT"
  | "value"
  | "label"
  | "sortkey"
  | "description";

@UntilDestroy()
@Injectable({
  providedIn: "root",
})
export class CodelistService {
  private store = inject(CodelistStore);
  private generalStore = inject(GeneralStore);

  private codelistStore$ = toObservable(this.store.entityMap);
  private catalogLanguage$ = toObservable(this.generalStore.catalogLanguage);

  private requestedCodelists = new Subject<string>();

  static mapToSelect = (
    codelist: Codelist,
    language = "de",
    sortBy:
      | CodelistSort
      | ((
          a: CodelistEntry,
          b: CodelistEntry,
          language: string,
        ) => number) = "label",
  ): SelectOptionUi[] => {
    if (!codelist) {
      return [];
    }

    // Sort codelist entries
    const sortFunction =
      typeof sortBy === "function"
        ? (a: CodelistEntry, b: CodelistEntry) => sortBy(a, b, language)
        : CodelistService.getSortFunction(sortBy, language);

    // Map to SelectOptionUi
    const items: SelectOptionUi[] = [...codelist.entries]
      .sort(sortFunction)
      .map(CodelistService.mapToSelectOptionUi(language));

    return CodelistService.addFavorites(codelist.id, items);
  };

  private static mapToSelectOptionUi(language: string) {
    return (entry: CodelistEntry) =>
      ({
        label:
          entry.fields[language] ?? entry.fields["de"] ?? entry.fields["name"],
        value: entry.id,
        sortkey: entry.fields["sortkey"],
      }) as SelectOptionUi;
  }

  private static getSortFunction(
    sortBy: CodelistSort,
    language: string = "de",
  ) {
    return (a: CodelistEntry, b: CodelistEntry) => {
      switch (sortBy) {
        case "label":
          return (a.fields[language] ?? a.fields["name"])?.localeCompare(
            b.fields[language] ?? b.fields["name"],
          );
        case "description":
          return a.description?.localeCompare(b.description);
        case "value":
          return a.id?.localeCompare(b.id);
        case "sortkey":
          return a.fields[sortBy]?.localeCompare(b.fields[sortBy], undefined, {
            numeric: true,
          });
        case "NO_SORT":
        default:
          return 0;
      }
    };
  }

  private queue = [];

  private static favorites: { [x: string]: string[] } = {};

  constructor(private dataService: CodelistDataService) {
    effect(() => {
      CodelistService.favorites = this.generalStore.favorites();
    });

    this.requestedCodelists
      .pipe(
        untilDestroyed(this),
        // Collect IDs within a time window of 100ms
        bufferTime(100),
        filter((ids) => ids.length > 0),
        distinct(),
        concatMap((ids) =>
          this.requestCodelists(ids).pipe(
            map((codelists) => this.prepareCodelists(codelists)),
            tap((codelists) => this.store.addCodelists(codelists)),
            tap(() => this.generalStore.setCodelistsLoaded()),
          ),
        ),
      )
      .subscribe();
  }

  byId(id: string): void {
    if (this.queue.indexOf(id) !== -1) return;

    this.queue.push(id);
    this.requestedCodelists.next(id);
  }

  update(): Observable<Codelist[]> {
    return this.dataService.update().pipe(
      map((codelists) => this.prepareCodelists(codelists)),
      tap((codelists) => this.store.setCodelists(codelists)),
      tap(() => this.generalStore.setCodelistsLoaded()),
      catchError((e) => this.handleSyncError(e)),
    );
  }

  private handleSyncError(e: HttpErrorResponse) {
    console.error(e);
    if (e.error.errorText === "Failed to synchronize code lists") {
      return throwError(
        () =>
          new IgeError(
            "Die Codelisten konnten nicht synchronisiert werden. Überprüfen Sie die Verbindung zum Codelist-Repository.",
          ),
      );
    }
    return throwError(() => e);
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
        tap((codelists) => this.store.addCodelists(codelists)),
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
        tap((codelists) => this.store.addCodelists(codelists)), //, { loading: true })),
      )
      .subscribe();
  }

  updateCodelist(codelist: Codelist): Observable<any> {
    const backendCodelist = this.prepareForBackend(codelist);
    return this.dataService
      .updateCodelist(backendCodelist)
      .pipe(tap(() => this.store.updateCodelist(codelist)));
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
      tap((codelists) =>
        codelists.forEach((codelist) => this.store.updateCodelist(codelist)),
      ),
    );
  }

  observe(
    codelistId: string,
    sortBy: CodelistSort = "label",
  ): Observable<SelectOptionUi[]> {
    return combineLatest([
      this.observeRaw(codelistId),
      this.catalogLanguage$,
    ]).pipe(
      map(([codelist, language]) =>
        CodelistService.mapToSelect(codelist, language, sortBy),
      ),
    );
  }

  observeRaw(codelistId: string): Observable<Codelist> {
    const alreadyInQueue = this.queue.some((item) => item === codelistId);
    const alreadyInStore = this.store.entityMap()[codelistId];

    if (!alreadyInQueue && !alreadyInStore) {
      this.byId(codelistId);
    }

    return this.codelistStore$.pipe(
      map((item) => item[codelistId]),
      filter((codelist) => !!codelist),
      // take(1), // if we complete observable then we cannot modify catalog codelist and see change immediately
    );
  }

  static addFavorites(
    codelistId: string,
    sortedItems: SelectOptionUi[],
  ): SelectOptionUi[] {
    const favorites = CodelistService.favorites[codelistId] ?? [];
    if (favorites.length === 0) return sortedItems;

    const favoriteItems = sortedItems.filter((item) =>
      favorites.find((fav) => item.value === fav),
    );

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

  getFavorite(id: string): CodelistEntry[] {
    const favorite = this.generalStore.favorites()[id];
    return (
      favorite?.map((entryId) =>
        this.store
          .entityMap()
          [id].entries.find((entry) => entry.id === entryId),
      ) ?? []
    );
  }

  updateFavorites(id: string, entryIds: string[]) {
    this.updateFavoriteInStore(id, entryIds);

    return this.dataService.updateFavorites(id, entryIds);
  }

  private updateFavoriteInStore(id: string, entryIds: string[]) {
    const newFavorites = {
      ...this.generalStore.favorites(),
    };
    newFavorites[id] = entryIds;
    this.generalStore.updateFavorites(newFavorites);
  }

  syncCodelistValues() {
    return this.dataService.syncCodelistValues();
  }
}
