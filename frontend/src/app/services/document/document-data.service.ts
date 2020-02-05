import {HttpClient} from "@angular/common/http";
import {ConfigService, Configuration} from "../config/config.service";
import {IgeDocument} from "../../models/ige-document";
import {Observable} from "rxjs";
import {Injectable} from "@angular/core";
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

  find(query: string): Observable<DocumentAbstract[]> {
    return this.http.get<DocumentAbstract[]>(
      `${this.configuration.backendUrl}datasets?query=${query}&sort=title`);
  }

  getChildren(parentId: string): Observable<any[]> {
    const url = `${this.configuration.backendUrl}tree/children` + (parentId ? `?parentId=${parentId}` : '');
    return this.http.get<any[]>(url)
      .pipe(
        // catchError( (err) => this.errorService.handle( err ) )
      );
  }

  load(id: string): Observable<IgeDocument> {
    return this.http.get<IgeDocument>(this.configuration.backendUrl + 'datasets/' + id);
  }

  save(data: IgeDocument): Observable<any> {
    if (data._id) {
      return this.http.put(this.configuration.backendUrl + 'datasets/' + data._id, data);

    } else {
      return this.http.post(this.configuration.backendUrl + 'datasets', data);

    }
  }

  publish(data: IgeDocument): Observable<any> {
    if (data._id === undefined) {
      return this.http.post(this.configuration.backendUrl + 'datasets?publish=true', data);

    } else {
      return this.http.put(this.configuration.backendUrl + 'datasets/' + data._id + '?publish=true', data);

    }
  }

  delete(ids: string[]): Observable<any> {
    return this.http.delete(this.configuration.backendUrl + 'datasets/' + ids, {responseType: 'text'});
  }

  revert(id: string): Observable<any> {
    return this.http.put(this.configuration.backendUrl + 'datasets/' + id + '?revert=true', {});
  }

  getPath(id: string): Observable<string[]> {
    return this.http.get<string[]>(this.configuration.backendUrl + 'datasets/' + id + '/path');
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
}
