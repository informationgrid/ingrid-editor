import {ErrorService} from '../services/error.service';
import {ConfigService, Configuration} from '../services/config/config.service';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {catchError} from 'rxjs/operators';

export interface ExportOptions {
  id: string,
  includeSubDocs: boolean,
  exportFormat: string,
  useDraft: boolean
}

export interface ExportFormOptions {
  tree: 'dataset' | 'sub' | 'thisAndSub';
  drafts: boolean
}

export interface ExportTypeInfo {
  type: string;
  name: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImportExportService {

  private configuration: Configuration;

  public static prepareExportInfo(docId: string, format: string, options: ExportFormOptions): ExportOptions {
    return {
      id: docId,
      includeSubDocs: options.tree === 'sub' || options.tree === 'thisAndSub',
      exportFormat: format,
      useDraft: options.drafts
    };
  }

  constructor(private http: HttpClient, configService: ConfigService,
              private errorService: ErrorService) {
    this.configuration = configService.getConfiguration();
  }

  import(file: File): Observable<any> {
    return this.http.post( this.configuration.backendUrl + 'import', file )
      .pipe(
        catchError( err => {
          this.errorService.handle( err );
          return err;
        } )
      );
  }

  export(options: ExportOptions): Observable<Blob> {
    return this.http.post( this.configuration.backendUrl + 'export', options, {responseType: 'blob'} );
  }

  getExportTypes(): Observable<ExportTypeInfo[]> {
    return this.http.get<ExportTypeInfo[]>( this.configuration.backendUrl + 'export?source=mcloud' );
  }

}
