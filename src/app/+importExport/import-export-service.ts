import {ErrorService} from '../services/error.service';
import {ConfigService} from '../config/config.service';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Http} from '@angular/http';

@Injectable()
export class ImportExportService {

  constructor(private http: Http, private configService: ConfigService,
              private errorService: ErrorService) {
  }

  import(file: File): Observable<any> {
    return this.http.post( this.configService.backendUrl + 'import', file )
      .map( data => data.json() )
      .catch( err => {
        this.errorService.handle( err );
        return err;
      } );
  }

  export(docId: string, inclSubDocs?: boolean) {
    let data = this.prepareExportInfo( docId, inclSubDocs );
    return this.http.post( this.configService.backendUrl + 'export', data );
  }

  private prepareExportInfo(docId: string, inclSubDocs: boolean): any {
    return {
      id: docId,
      includeSubDocs: inclSubDocs
    };
  }
}
