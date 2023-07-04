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
import { merge, Observable, Subject } from "rxjs";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { distinct, filter, map, switchMap, tap } from "rxjs/operators";
import { applyTransaction, arrayUpdate, arrayUpsert } from "@datorama/akita";
import { CodelistQuery } from "../../store/codelist/codelist.query";

export class SelectOption {
  label: string;
  value: string;

  static fromBackend(option: BackendOption): SelectOption {
    return option ? new SelectOption(option.key, option.value) : null;
  }

  constructor(value: string, label: string) {
    this.label = label;
    this.value = value;
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
    sort = true
  ): SelectOptionUi[] => {
    if (!codelist) {
      return [];
    }

    const items = codelist.entries.map(
      (entry) =>
        ({
          label: entry.fields[language] ?? entry.fields["name"],
          value: entry.id,
        } as SelectOptionUi)
    );

    return sort ? items.sort((a, b) => a.label?.localeCompare(b.label)) : items;
  };
  private queue = [];
  private batchProcessed = true;

  constructor(
    private store: CodelistStore,
    protected codelistQuery: CodelistQuery,
    private dataService: CodelistDataService
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
        tap(() => (this.batchProcessed = true))
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
      map((codelists) => this.prepareCodelists(codelists)),
      tap((codelists) => this.store.set(codelists))
    );
  }

  private requestCodelists(ids: string[]): Observable<CodelistBackend[]> {
    return this.dataService.byIds(ids);
  }

  private prepareCodelists(codelists: CodelistBackend[]): Codelist[] {
    return codelists.map((codelist) => ({
      id: codelist.id,
      name: codelist.name,
      description: codelist.description,
      entries: this.prepareEntries(codelist.entries),
      default: codelist.defaultEntry,
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
        tap((codelists) => this.store.set(codelists))
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
        map((codelists) => this.prepareCodelists(codelists)),
        tap((codelists) =>
          this.store.update({
            catalogCodelists: codelists,
          })
        )
      )
      .subscribe();
  }

  updateCodelist(codelist: Codelist): Observable<any> {
    const backendCodelist = this.prepareForBackend(codelist);
    return this.dataService.updateCodelist(backendCodelist).pipe(
      tap(() =>
        this.store.update(({ catalogCodelists }) => ({
          catalogCodelists: arrayUpdate(
            catalogCodelists,
            codelist.id,
            codelist
          ),
        }))
      )
    );
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
    entries: CodelistEntry[]
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
      map((codelists) => this.prepareCodelists(codelists)),
      tap((codelists) => this.updateStore(codelists))
    );
  }

  private updateStore(codelists: Codelist[]) {
    applyTransaction(() => {
      codelists.forEach((codelist) => {
        this.store.update(({ catalogCodelists }) => ({
          catalogCodelists: arrayUpsert(
            catalogCodelists,
            codelist.id,
            codelist
          ),
        }));
      });
    });
  }

  observe(codelistId: string): Observable<SelectOptionUi[]> {
    return this.observeRaw(codelistId).pipe(
      map((codelist) => CodelistService.mapToSelect(codelist))
    );
  }

  observeRaw(codelistId: string): Observable<Codelist> {
    const alreadyInQueue = this.queue.some((item) => item === codelistId);
    const alreadyInStore =
      this.codelistQuery.getCatalogCodelist(codelistId) ||
      this.codelistQuery.getEntity(codelistId);

    if (!alreadyInQueue && !alreadyInStore) {
      this.byId(codelistId);
    }

    return merge(
      this.codelistQuery.selectEntity(codelistId),
      this.codelistQuery.selectCatalogCodelist(codelistId)
    ).pipe(
      filter((codelist) => !!codelist)
      // take(1), // if we complete observable then we cannot modify catalog codelist and see change immediately
    );
  }
}
