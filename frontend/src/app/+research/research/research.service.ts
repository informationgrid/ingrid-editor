import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ConfigService, Configuration} from '../../services/config/config.service';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';

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
              configService: ConfigService) {
    this.configuration = configService.getConfiguration();
  }

  getQuickFilter(): Observable<FacetGroup[]> {
    return this.http.get<FacetGroup[]>(`${this.configuration.backendUrl}search/quickFilter`)
      .pipe(
        tap(filters => this.filters = filters)
      );
  }

  search(term: string, model: any, fieldsWithParameters: { [x: string]: any[] }): Observable<ResearchResponse> {
    const body = this.prepareQuery(model, fieldsWithParameters);
    return this.http.post<ResearchResponse>(`${this.configuration.backendUrl}search/query`, {
      term: term,
      clauses: body
    });
  }

  private prepareQuery(model: any, fieldsWithParameters: { [x: string]: any[] }) {
    let activeFilterIds = {op: 'AND', clauses: []};

    Object.keys(model)
      .map(groupKey => {
        let groupValue = model[groupKey];
        if (groupValue instanceof Object) {
          let activeItemsFromGroup = Object.keys(groupValue).filter(groupId => groupValue[groupId]);
          if (activeItemsFromGroup.length > 0) {
            if (fieldsWithParameters.hasOwnProperty(activeItemsFromGroup[0])) {
              activeFilterIds.clauses.push({
                op: 'OR',
                value: [...activeItemsFromGroup],
                parameter: fieldsWithParameters[activeItemsFromGroup[0]]
              });
            } else {
              activeFilterIds.clauses.push({op: 'OR', value: [...activeItemsFromGroup]});
            }
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

  export() {
    let csv = '\ufeff';
  }

  private exportToFile(content: string, exportFilename: string) {
    const blob = new Blob([content], {
      type: 'text/csv;charset=utf-8;'
    });

    if (window.navigator.msSaveOrOpenBlob) {
      navigator.msSaveOrOpenBlob(blob, exportFilename + '.csv');
    } else {
      const link = document.createElement('a');
      link.style.display = 'none';
      document.body.appendChild(link);
      if (link.download !== undefined) {
        link.setAttribute('href', URL.createObjectURL(blob));
        link.setAttribute('download', exportFilename + '.csv');
        link.click();
      } else {
        content = 'data:text/csv;charset=utf-8,' + content;
        window.open(encodeURI(content));
      }
      document.body.removeChild(link);
    }
  }
}
