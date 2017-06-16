import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {ConfigService} from '../config/config.service';
import {ErrorService} from './error.service';
import {AuthHttp} from 'angular2-jwt';
import {Response} from '@angular/http';

@Injectable()
export class ApiService {
  constructor(private http: AuthHttp, private configService: ConfigService,
              private errorService: ErrorService) {
  }

  getIsoDocument(id: number): Observable<any> {
    return this.http.get( this.configService.backendUrl + 'datasets/' + id + '/export/ISO' )
      .map( (result: Response) => {
        return result.text();
      } )
      .catch( error => this.errorService.handle( error ) );
  }

}
