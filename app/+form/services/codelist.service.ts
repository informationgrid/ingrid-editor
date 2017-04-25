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

  constructor(private http: AuthHttp, private configService: ConfigService,
    private errorService: ErrorService) {
    /*this.codelists['8000'] = {
     id: '8000',
     values: [
     {id: '1', value: 'Eins'},
     {id: '2', value: 'Zwei'},
     {id: '3', value: 'Drei'}
     ]
     }*/
  }

  byId(id: string): Promise<CodelistEntry[]> {

    return new Promise( (resolve, reject) => {
      if (this.codelists[id]) {

        resolve( this.codelists[id].entries );

      } else {

        this.http.get( this.configService.backendUrl + 'codelist/' + id )
          .catch( (err: any) => this.errorService.handle( err ) )
          .subscribe( (data: any) => {
            // debugger
            this.codelists[id] = data.json();
            let entries = this.codelists[id].entries;
            resolve( this.prepareEntries(entries) );
          }, (err) => reject( err ) );
      }
    } );
  }

  prepareEntries(entries: any[]) {
    let result: any[] = [];
    entries.forEach(entry => {
      let item = {
        id: entry.id,
        value: this.getLocalisedValue( entry.localisations )
      };
      result.push(item);
    });
    return result;
  }

  getLocalisedValue(locals: any[]) {
    let result = locals.filter(local => local[0] === 'de');
    return result[0][1];
  }
}