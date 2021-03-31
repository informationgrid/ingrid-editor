import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ConfigService, Configuration} from '../services/config/config.service';
import {Observable} from 'rxjs';
import {map, tap} from 'rxjs/operators';
import {QueryStore} from '../store/query/query.store';
import {Query} from '../store/query/query.model';
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
  selection: 'CHECKBOX' | 'RADIO' | 'DOC_ADDRESS' | 'SPATIAL';
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
  facetModel: any;

  constructor(private http: HttpClient,
              configService: ConfigService,
              private queryStore: QueryStore) {
    this.configuration = configService.getConfiguration();
  }

  getQuickFilter(): Observable<FacetGroup[]> {
    return this.http.get<FacetGroup[]>(`${this.configuration.backendUrl}search/quickFilter`)
      .pipe(
        tap(filters => this.filters = filters),
        tap(filters => this.createFacetModel(filters))
      );
  }

  private createFacetModel(filters: FacetGroup[]) {
    this.facetModel = {};
    filters.forEach(group => {
      this.facetModel[group.id] = {};
    });
  }


  search(term: string, model: any, fieldsWithParameters: { [x: string]: any[] }): Observable<ResearchResponse> {
    const backendQuery = new BackendQuery(term, model, fieldsWithParameters);
    return this.http.post<ResearchResponse>(`${this.configuration.backendUrl}search/query`, backendQuery.get());
  }

  searchBySQL(sql: string): Observable<ResearchResponse> {
    return this.http.post<ResearchResponse>(`${this.configuration.backendUrl}search/querySql`, sql);
  }

  fetchQueries(): void {
    this.http.get<BackendStoreQuery[]>(`${this.configuration.backendUrl}search`)
      .pipe(
        map(queries => queries.map(q => this.convertToFrontendQuery(q))),
        tap(queries => this.queryStore.set(queries))
      ).subscribe();
  }

  saveQuery(newQuery: Query): Observable<Query> {
    return this.http.post<BackendStoreQuery>(`${this.configuration.backendUrl}search`, this.convertToBackendQuery(newQuery))
      .pipe(
        map(response => this.convertToFrontendQuery(response)),
        tap(response => this.queryStore.add(response))
      );
  }

  convertToFrontendQuery(query: BackendStoreQuery): Query {
    return {
      id: query.id,
      type: query.category,
      name: query.name,
      description: query.description,
      term: query.term,
      model: query.model,
      parameter: query.parameters
    };
  }

  convertToBackendQuery(query: Query): BackendStoreQuery {
    return {
      id: query.id,
      name: query.name,
      category: query.type,
      description: query.description,
      term: query.term,
      model: query.model,
      parameters: query.parameter
    };
  }
}
