import {HttpClient} from '@angular/common/http';
import {ConfigService, Configuration} from '../config/config.service';
import {IgeDocument} from '../../models/ige-document';
import {Observable} from 'rxjs';
import {Injectable} from '@angular/core';
import {DocumentAbstract} from '../../store/document/document.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentDataService {
  private configuration: Configuration;
  private titleFields: string;

  constructor(private http: HttpClient, configService: ConfigService) {

    configService.$userInfo.subscribe(info => {
      if (info.assignedCatalogs.length > 0) {

        /*configService.promiseProfilePackageLoaded.then(() => {
          this.titleFields = configService.getTitleFields().join(',');
        });*/
      }
      this.configuration = configService.getConfiguration();
    });
  }

  find(query: string, size: number = 10): Observable<DocumentAbstract[]> {
    return this.http.get<DocumentAbstract[]>(
      `${this.configuration.backendUrl}datasets?query=${query}&sort=title&size=${size}`);
  }

  getChildren(parentId: string, isAddress = false): Observable<any[]> {
    const params = this.createGetChildrenParams(parentId, isAddress);
    const url = `${this.configuration.backendUrl}tree/children` + params;
    return this.http.get<any[]>(url)
      .pipe(
        // catchError( (err) => this.errorService.handle( err ) )
      );
  }

  load(id: string, address = false): Observable<IgeDocument> {
    const params = '?address=' + address;
    return this.http.get<IgeDocument>(this.configuration.backendUrl + 'datasets/' + id + params);
  }

  save(data: IgeDocument, isAddress?: boolean): Observable<any> {
    const params = isAddress ? '?address=true' : '';
    if (data._id) {
      return this.http.put(this.configuration.backendUrl + 'datasets/' + data._id + params, data);

    } else {
      return this.http.post(this.configuration.backendUrl + 'datasets' + params, data);

    }
  }

  publish(data: IgeDocument): Observable<any> {
    if (data._id === undefined) {
      return this.http.post(this.configuration.backendUrl + 'datasets?publish=true', data);

    } else {
      return this.http.put(this.configuration.backendUrl + 'datasets/' + data._id + '?publish=true', data);

    }
  }

    delete(ids: string[], forAddress?: boolean): Observable<any> {
    const params = forAddress ? '?address=true' : '';
    return this.http.delete(this.configuration.backendUrl + 'datasets/' + ids + params, {responseType: 'text'});
  }

  revert(id: string): Observable<any> {
    return this.http.put(this.configuration.backendUrl + 'datasets/' + id + '?revert=true', {});
  }

  getPath(id: string, address = false): Observable<string[]> {
    const params = '?address=' + address;
    return this.http.get<string[]>(this.configuration.backendUrl + 'datasets/' + id + '/path' + params);
  }

  copy(srcIDs: string[], dest: string, includeTree: boolean) {
    const body = this.prepareCopyCutBody(dest, includeTree);
    return this.http.post(this.configuration.backendUrl + 'datasets/' + srcIDs.join(',') + '/copy', body);
  }

  move(srcIDs: string[], dest: string, includeTree: boolean) {
    const body = this.prepareCopyCutBody(dest, includeTree);
    return this.http.post(this.configuration.backendUrl + 'datasets/' + srcIDs.join(',') + '/move', body);
  }

  private prepareCopyCutBody(dest: string, includeTree: boolean): any {
    const body = {
      // srcIds: src,
      destId: dest
    };
    return body;
  }

  private createGetChildrenParams(parentId: string, isAddress: boolean): string {
    let params = '';
    if (parentId) {
      params += `?parentId=${parentId}`;
    }
    if (isAddress) {
      params += params.length > 0 ? '&' : '?';
      params += 'address=true';
    }
    return params;
  }
}
