import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {ConfigService, Configuration} from '../config/config.service';
import {Injectable} from '@angular/core';
import {CodelistBackend} from '../../store/codelist/codelist.model';

@Injectable({
  providedIn: 'root'
})
export class CodelistDataService {
  private configuration: Configuration;

  constructor(private http: HttpClient, configService: ConfigService) {
    this.configuration = configService.getConfiguration();
  }

  byId(id: string): Observable<CodelistBackend> {
    return this.http.get<CodelistBackend>(this.configuration.backendUrl + 'codelist/' + id);
  }

  byIds(ids: string[]) {
    return this.http.get<CodelistBackend[]>(this.configuration.backendUrl + 'codelists/' + ids.join(','));

  }
}
