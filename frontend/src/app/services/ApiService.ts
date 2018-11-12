import { Injectable } from '@angular/core';
import { ConfigService, Configuration } from './config/config.service';
import { ErrorService } from './error.service';
import { User } from '../+user/user';
import { Role } from '../models/user-role';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/index';
import { catchError, map } from 'rxjs/internal/operators';


@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private configuration: Configuration;

  constructor(private http: HttpClient, configService: ConfigService,
              private errorService: ErrorService) {
    this.configuration = configService.getConfiguration();
  }

  getIsoDocument(id: number): Observable<any> {
    return this.http.get( this.configuration.backendUrl + 'datasets/' + id + '/export/ISO', {responseType: 'text'} );
      // .pipe( catchError( error => this.errorService.handle( error ) ) );
  }



  logout() {
    return this.http.get( this.configuration.backendUrl + 'logout' );
  }

}
