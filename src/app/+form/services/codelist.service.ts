import {Injectable} from '@angular/core';
import {AuthHttp} from 'angular2-jwt';
import {ConfigService} from '../../config/config.service';
import {ErrorService} from '../../services/error.service';

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

  static getLocalisedValue(locals: any[]) {
    const result = locals.filter( local => local[0] === 'de' );
    return result[0][1];
  }

  constructor(private http: AuthHttp, private configService: ConfigService, private errorService: ErrorService) {
  }

  byId(id: string): Promise<CodelistEntry[]> {

    return new Promise( (resolve, reject) => {
      if (this.codelists[id]) {

        resolve( this.codelists[id].entries );

      } else {

        this.http.get( this.configService.backendUrl + 'codelist/' + id )
          .catch( (err: any) => this.errorService.handle( err ) )
          .subscribe( (data: any) => {
            this.codelists[id] = data.json();
            const entries = this.codelists[id].entries;
            resolve( this.prepareEntries( entries ) );
          }, (err) => reject( err ) );
      }
    } );
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
