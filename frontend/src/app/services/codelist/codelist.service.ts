import {Injectable} from '@angular/core';
import {ErrorService} from '../error.service';
import {CodelistDataService} from './codelist-data.service';
import {Codelist, CodelistBackend, CodelistEntry, CodelistEntryBackend} from '../../store/codelist/codelist.model';
import {CodelistStore} from '../../store/codelist/codelist.store';
import {Observable, ReplaySubject, Subject} from 'rxjs';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {buffer, distinct, filter, map, switchMap, tap} from 'rxjs/operators';

export interface SelectOption {
  label: string;
  value: string;
}

@UntilDestroy()
@Injectable({
  providedIn: 'root'
})
export class CodelistService {

  private requestedCodelists = new ReplaySubject<string>(100);
  private collector = new Subject();

  static mapToSelectSorted = (codelist: Codelist): SelectOption[] => {
    if (!codelist) {
      return [];
    }

    return codelist.entries
      .map(entry => ({label: entry.value, value: entry.id} as SelectOption))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  static getLocalisedValue(locals: any) {
    return locals.de;
  }

  constructor(private errorService: ErrorService,
              private store: CodelistStore,
              private dataService: CodelistDataService) {

    this.requestedCodelists
      .pipe(
        untilDestroyed(this),
        // ignore multiple same ids
        distinct(),
        // collect multiple ids for the request
        buffer(this.collector),
        filter(ids => ids.length > 0),
        switchMap(ids => this.requestCodelists(ids)),
        map(codelists => this.prepareCodelists(codelists)),
        tap(codelists => this.store.add(codelists))
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

    return this.dataService.update()
      .pipe(
        map(codelists => this.prepareCodelists(codelists))
      );

  }

  private requestCodelists(ids: string[]): Observable<CodelistBackend[]> {
    return this.dataService.byIds(ids);
    // .pipe(map(x => [x])); // TODO: implement correct values
  }

  private prepareCodelists(codelists: CodelistBackend[]): Codelist[] {
    return codelists.map(codelist => ({
      id: codelist.id,
      name: codelist.name,
      entries: this.prepareEntries(codelist.entries)
    }));
  }

  private prepareEntries(entries: CodelistEntryBackend[]): CodelistEntry[] {
    return entries.map(entry => ({
        id: entry.id,
        value: CodelistService.getLocalisedValue(entry.localisations)
      })
    );
  }

  getAll() {
    return this.dataService.getAll()
      .pipe(
        map(codelists => this.prepareCodelists(codelists))
      );
  }
}
