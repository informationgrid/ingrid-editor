import { Injectable } from '@angular/core';
import { ConfigService, Configuration } from '../../services/config.service';
import { ErrorService } from '../../services/error.service';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/internal/operators';

export interface Codelist {
  id: string;
  entries: CodelistEntry[];
}

export interface CodelistEntry {
  id: string;
  value: string;
  data?: string;
}

@Injectable()
export class CodelistService {

  codelists: { [id: string]: Codelist } = {};
  pendingCodelists: { [id: string]: Promise<CodelistEntry[]> } = {};
  private configuration: Configuration;

  static getLocalisedValue(locals: any[]) {
    const result = locals.filter( local => local[0] === 'de' );
    return result[0][1];
  }

  constructor(private http: HttpClient, private configService: ConfigService, private errorService: ErrorService) {
    this.configuration = configService.getConfiguration();
  }

  byId(id: string): Promise<CodelistEntry[]> {

    if (this.codelists[id]) {
      return Promise.resolve( this.codelists[id].entries );
    }

    // if codelist is being loaded then return the promise
    if (this.pendingCodelists[id]) {
      return this.pendingCodelists[id];
    }

    const myPromise = new Promise<CodelistEntry[]>( (resolve, reject) => {

      this.http.get( this.configuration.backendUrl + 'codelist/' + id )
        .pipe(
          catchError( (err) => {
            this.codelists[id] = null;
            return this.errorService.handleOwn( 'Could not load codelist: ' + id, err.message );
          } )
        )
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

}
