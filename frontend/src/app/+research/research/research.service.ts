import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ConfigService, Configuration} from '../../services/config/config.service';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {QueryStore} from '../../store/query/query.store';
import {Query} from '../../store/query/query.model';
import {BackendQuery} from './backend-query.model';
import {BackendStoreQuery} from './backend-store-query.model';

export interface QuickFilter {
  id: string;
  label: string;
  implicitFilter: string[];
}

export interface FacetGroup {
  id: string;
  label: string;
  filter: QuickFilter[];
  combine: 'AND' | 'OR';
  selection: 'AND' | 'OR' | 'SPATIAL';
}

export class ResearchResponse {
  totalHits: number;
  hits: any[];
}

@Injectable({
  providedIn: 'root'
})
export class ResearchService {

  private configuration: Configuration;
  private filters: FacetGroup[];

  constructor(private http: HttpClient,
              configService: ConfigService,
              private queryStore: QueryStore) {
    this.configuration = configService.getConfiguration();
  }

  getQuickFilter(): Observable<FacetGroup[]> {
    return this.http.get<FacetGroup[]>(`${this.configuration.backendUrl}search/quickFilter`)
      .pipe(
        tap(filters => this.filters = filters)
      );
  }

  search(term: string, model: any, fieldsWithParameters: { [x: string]: any[] }): Observable<ResearchResponse> {
    const backendQuery = new BackendQuery(term, model, fieldsWithParameters);
    return this.http.post<ResearchResponse>(`${this.configuration.backendUrl}search/query`, backendQuery.get());
  }

  searchBySQL(sql: string): Observable<ResearchResponse> {
    return this.http.post<ResearchResponse>(`${this.configuration.backendUrl}search/querySql`, sql);
  }

  loadQueries(): Observable<Query[]> {
    return this.http.get<Query[]>(`${this.configuration.backendUrl}search`)
      .pipe(
        tap(queries => this.queryStore.set(queries))
      )
  }

  saveQuery(term: string, model: any, fieldsWithParameters: { [x: string]: any[] }) {
    const query = new BackendStoreQuery(term, model, fieldsWithParameters);
    return this.http.post(`${this.configuration.backendUrl}search`, query.get());

  }

}
