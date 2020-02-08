import {Injectable} from '@angular/core';
import {ErrorService} from '../error.service';
import {CodelistDataService} from './codelist-data.service';

export interface Codelist {
  id: string;
  entries: CodelistEntry[];
}

export interface CodelistEntry {
  id: string;
  value: string;
  data?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CodelistService {

  codelists: { [id: string]: Codelist } = {};
  pendingCodelists: { [id: string]: Promise<CodelistEntry[]> } = {};

  static getLocalisedValue(locals: any[]) {
    const result = locals.filter( local => local[0] === 'de' );
    return result[0][1];
  }

  constructor(private errorService: ErrorService,
              private dataService: CodelistDataService) {
  }

  byId(id: string): Promise<CodelistEntry[]> {

    if (this.codelists[id]) {
      return Promise.resolve( this.mapCodelist(this.codelists[id].entries) );
    }

    // if codelist is being loaded then return the promise
    if (this.pendingCodelists[id]) {
      return this.pendingCodelists[id];
    }

    const myPromise = new Promise<CodelistEntry[]>( (resolve, reject) => {

      this.dataService.byId(id)
        .subscribe( (data: any) => {
          if (data === null) {
            reject( 'Codelist could not be read: ' + id );
          } else {
            this.codelists[id] = data;
            const entries = (<Codelist>this.codelists[id]).entries;
            if (entries) {
              resolve( this.prepareEntries( entries ) );
            } else {
              reject( 'This codelist does not exist: ' + id );
            }
            this.pendingCodelists[id] = null;
          }
        }, (err) => reject( err ) );

    } );

    if (this.codelists[id] === undefined) {
      this.pendingCodelists[id] = myPromise;
    }

    return myPromise;
  }

  byIds(ids: string[]): Promise<Array<CodelistEntry[]>> {
    const promises = [];

    ids.forEach( id => {
      promises.push( this.byId( id ) );
    } );
    return Promise.all( promises );
  }

  prepareEntries(entries: any[]) {
    const result: any[] = [];
    entries.forEach( entry => {
      const item = {
        id: entry.id,
        value: CodelistService.getLocalisedValue( entry.localisations )
      };
      result.push( item );
    } );
    return result;
  }

  private mapCodelist(entries: any[]) {
    return entries.map( e => {
      return {
        id: e.id,
        value: e.localisations[0][1]
      };
    });
  }
}
