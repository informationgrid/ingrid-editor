import {ErrorService} from '../services/error.service';
import { ConfigService, Configuration } from '../config/config.service';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ImportExportService {

  private configuration: Configuration;

  constructor(private http: HttpClient, configService: ConfigService,
              private errorService: ErrorService) {
    this.configuration = configService.getConfiguration();
  }

  import(file: File): Observable<any> {
    return this.http.post( this.configuration.backendUrl + 'import', file )
      .catch( err => {
        this.errorService.handle( err );
        return err;
      } );
  }

  export(docId: string, inclSubDocs?: boolean) {
    const data = this.prepareExportInfo( docId, inclSubDocs );
    return this.http.post( this.configuration.backendUrl + 'export', data );
  }

  private prepareExportInfo(docId: string, inclSubDocs: boolean): any {
    return {
      id: docId,
      includeSubDocs: inclSubDocs
    };
  }
}
