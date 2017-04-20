import {Injectable} from '@angular/core';
import {AuthHttp} from 'angular2-jwt';
import {ConfigService} from '../../config/config.service';
import {ErrorService} from '../../services/error.service';

export interface Codelist {
  id: string;
  values: CodelistEntry[];
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

        resolve( this.codelists[id].values );

      } else {

        this.http.get( this.configService.backendUrl + 'codelist/' + id )
          .catch( (err: any) => this.errorService.handle( err ) )
          .subscribe( (data: any) => {
            debugger
            this.codelists[id] = data.json();
            resolve( this.codelists[id].values );
          }, (err) => reject( err ) );

      }
    } );
  }

}