import { Injectable } from "@angular/core";
import { CodelistDataService } from "./codelist-data.service";
import {
  Codelist,
  CodelistBackend,
  CodelistEntry,
  CodelistEntryBackend,
} from "../../store/codelist/codelist.model";
import { CodelistStore } from "../../store/codelist/codelist.store";
import { Observable, ReplaySubject, Subject } from "rxjs";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { buffer, distinct, filter, map, switchMap, tap } from "rxjs/operators";
import { applyTransaction, arrayUpdate, arrayUpsert } from "@datorama/akita";

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

@UntilDestroy()
@Injectable({
  providedIn: "root",
})
export class CodelistService {
  private requestedCodelists = new ReplaySubject<string>(100);
  private collector = new Subject();

  static mapToSelectSorted = (codelist: Codelist): SelectOption[] => {
    if (!codelist) {
      return [];
    }

    return codelist.entries
      .map(
        (entry) =>
          ({
            label: entry.fields["de"] ?? entry.fields["name"],
            value: entry.id,
          } as SelectOption)
      )
      .sort((a, b) => a.label?.localeCompare(b.label));
  };

  constructor(
    private store: CodelistStore,
    private dataService: CodelistDataService
  ) {
    this.requestedCodelists
      .pipe(
        untilDestroyed(this),
        // ignore multiple same ids
        distinct(),
        // collect multiple ids for the request
        buffer(this.collector),
        filter((ids) => ids.length > 0),
        switchMap((ids) => this.requestCodelists(ids)),
        map((codelists) => this.prepareCodelists(codelists)),
        tap((codelists) => this.store.add(codelists))
      )
      .subscribe();
  }

  byId(id: string): void {
    // add codelist id to the queue to be requested
    this.requestedCodelists.next(id);

    // give some time to collect multiple codelists before sending request
    setTimeout(() => this.collector.next(), 100);
  }

  update(): Observable<Codelist[]> {
    return this.dataService.update().pipe(
      map((codelists) => this.prepareCodelists(codelists)),
      tap((codelists) => this.store.set(codelists))
    );
  }

  private requestCodelists(ids: string[]): Observable<CodelistBackend[]> {
    return this.dataService.byIds(ids);
    // .pipe(map(x => [x])); // TODO: implement correct values
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

  mapToOptions(codelists: Codelist[]): SelectOption[] {
    return codelists
      .map((cl) => ({
        value: cl.id,
        label: cl.name,
      }))
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
}
