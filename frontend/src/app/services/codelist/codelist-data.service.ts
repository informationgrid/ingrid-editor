import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {ConfigService, Configuration} from '../config/config.service';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CodelistDataService {
  private configuration: Configuration;

  constructor(private http: HttpClient, configService: ConfigService) {
    this.configuration = configService.getConfiguration();
  }

  byId(id: string): Observable<any> {
    return this.http.get( this.configuration.backendUrl + 'codelist/' + id )
      .pipe(
        /*catchError( (err) => {
          this.codelists[id] = null;
          return this.errorService.handleOwn( 'Could not load codelist: ' + id, err.message );
        } )*/
      );
  }
}
