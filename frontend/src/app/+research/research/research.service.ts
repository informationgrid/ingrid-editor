import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ConfigService, Configuration} from '../../services/config/config.service';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';

export interface QuickFilter {
  id: string;
  label: string;
}

export interface FacetGroup {
  id: string;
  label: string;
  filter: QuickFilter[];
  combine: 'AND' | 'OR';
  selection: 'AND' | 'OR';
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
              configService: ConfigService) {
    this.configuration = configService.getConfiguration();
  }

  getQuickFilter(): Observable<FacetGroup[]> {
    return this.http.get<FacetGroup[]>(`${this.configuration.backendUrl}search/quickFilter`)
      .pipe(
        tap(filters => this.filters = filters)
      );
  }

  search(model: any): Observable<ResearchResponse> {
    const body = this.prepareQuery(model);
    return this.http.post<ResearchResponse>(`${this.configuration.backendUrl}search/query`, {
      clauses: body
    });
  }

  private prepareQuery(model: any) {
    let activeFilterIds = {op: 'AND', clauses: []};

    Object.keys(model)
      .map(groupKey => {
        let groupValue = model[groupKey];
        if (groupValue instanceof Object) {
          let activeItemsFromGroup = Object.keys(groupValue).filter(groupId => groupValue[groupId]);
          if (activeItemsFromGroup.length > 0) {
            activeFilterIds.clauses.push({op: 'OR', value: [...activeItemsFromGroup]});
          }
        } else {
          activeFilterIds.clauses.push({op: 'OR', value: [groupValue]});
        }
      });

    return activeFilterIds;
  }

  searchBySQL(sql: string): Observable<ResearchResponse> {
    return this.http.post<ResearchResponse>(`${this.configuration.backendUrl}search/querySql`, sql);
  }
}
