import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {
  ConfigService,
  Configuration,
} from "../services/config/config.service";
import { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";
import { QueryState, QueryStore } from "../store/query/query.store";
import { FacetQuery, Query, SqlQuery } from "../store/query/query.model";
import { BackendQuery } from "./backend-query.model";
import { BackendStoreQuery } from "./backend-store-query.model";
import { ProfileService } from "../services/profile.service";
import { SaveQueryDialogResponse } from "./save-query-dialog/save-query-dialog.response";

export interface QuickFilter {
  id: string;
  label: string;
  implicitFilter: string[];
}

export interface Facets {
  addresses: FacetGroup[];
  documents: FacetGroup[];
}

export interface FacetGroup {
  id: string;
  label: string;
  filter: QuickFilter[];
  combine: "AND" | "OR";
  selection: "CHECKBOX" | "RADIO" | "DOC_ADDRESS" | "SPATIAL";
}

export class ResearchResponse {
  totalHits: number;
  hits: any[];
}

@Injectable({
  providedIn: "root",
})
export class ResearchService {
  facetModel: any;
  private configuration: Configuration;
  private filters: Facets;

  constructor(
    private http: HttpClient,
    configService: ConfigService,
    private profileService: ProfileService,
    private queryStore: QueryStore
  ) {
    this.configuration = configService.getConfiguration();
  }

  getQuickFilter(): Observable<Facets> {
    return this.http
      .get<Facets>(`${this.configuration.backendUrl}search/quickFilter`)
      .pipe(
        tap((filters) => (this.filters = filters)),
        tap((filters) => this.createFacetModel(filters))
      );
  }

  search(
    term: string,
    model: any,
    fieldsWithParameters: { [x: string]: any[] }
  ): Observable<ResearchResponse> {
    const backendQuery = new BackendQuery(term, model, fieldsWithParameters);
    return this.http
      .post<ResearchResponse>(
        `${this.configuration.backendUrl}search/query`,
        backendQuery.get()
      )
      .pipe(map((result) => this.mapDocumentIcons(result)));
  }

  searchBySQL(sql: string): Observable<ResearchResponse> {
    return this.http
      .post<ResearchResponse>(
        `${this.configuration.backendUrl}search/querySql`,
        sql
      )
      .pipe(map((result) => this.mapDocumentIcons(result)));
  }

  fetchQueries(): void {
    this.http
      .get<BackendStoreQuery[]>(`${this.configuration.backendUrl}search`)
      .pipe(
        map((queries) => queries.map((q) => this.convertToFrontendQuery(q))),
        tap((queries) => this.queryStore.set(queries))
      )
      .subscribe();
  }

  saveQuery(
    state: QueryState,
    dialogOptions: SaveQueryDialogResponse,
    asSql: boolean
  ): Observable<SqlQuery | FacetQuery> {
    const preparedQuery = this.prepareQuery(state, dialogOptions, asSql);
    return this.http
      .post<BackendStoreQuery>(
        `${this.configuration.backendUrl}search?forCatalog=${dialogOptions.forCatalog}`,
        this.convertToBackendQuery(preparedQuery)
      )
      .pipe(
        map((response) => this.convertToFrontendQuery(response)),
        tap((response) => this.queryStore.add(response))
      );
  }

  convertToFrontendQuery(query: BackendStoreQuery): SqlQuery | FacetQuery {
    const base = <Query>{
      id: query.id,
      type: query.category,
      name: query.name,
      description: query.description,
      modified: query.modified,
      isCatalogQuery: query.isSystemQuery,
    };

    if (query.category === "facet") {
      return <FacetQuery>{
        ...base,
        term: query.settings.term,
        model: query.settings.model,
        parameter: query.settings.parameters,
      };
    } else {
      return <SqlQuery>{
        ...base,
        sql: query.settings.sql,
      };
    }
  }

  convertToBackendQuery(query: SqlQuery | FacetQuery): BackendStoreQuery {
    return {
      id: query.id,
      name: query.name,
      category: query.type,
      description: query.description,
      settings: this.createSettings(query),
    };
  }

  removeQuery(id: string) {
    return this.http
      .delete(`${this.configuration.backendUrl}search/query/${id}`)
      .pipe(tap(() => this.queryStore.remove(id)));
  }

  updateUIState(partialState: {
    currentTab?: number;
    search?: any;
    sqlSearch?: any;
  }) {
    this.queryStore.update((state) => {
      const newState: QueryState = {
        ui: {
          ...state.ui,
        },
      };
      if (partialState.currentTab !== undefined) {
        newState.ui.currentTabIndex = partialState.currentTab;
      }
      if (partialState.search) {
        newState.ui.search = { ...state.ui.search, ...partialState.search };
      }
      if (partialState.sqlSearch) {
        newState.ui.sql = { ...state.ui.sql, ...partialState.sqlSearch };
      }
      return newState;
    });
  }

  private createFacetModel(filters: Facets) {
    this.facetModel = {
      addresses: {},
      documents: {},
    };
    filters.addresses.forEach((group) => {
      this.facetModel.addresses[group.id] = {};
    });
    filters.documents.forEach((group) => {
      this.facetModel.documents[group.id] = {};
    });
  }

  private createSettings(query: SqlQuery | FacetQuery) {
    return query.type === "facet"
      ? {
          term: query.term,
          model: query.model,
          parameters: query.parameter,
        }
      : {
          sql: query.sql,
        };
  }

  private mapDocumentIcons(data: ResearchResponse): ResearchResponse {
    data.hits.forEach((hit) => {
      hit.icon = this.profileService.getDocumentIcon(hit);
    });
    return data;
  }

  private prepareQuery(
    state: QueryState,
    response: SaveQueryDialogResponse,
    asSql: boolean
  ): SqlQuery | FacetQuery {
    let base = {
      id: null,
      name: response.name,
      description: response.description,
    };

    if (asSql) {
      return {
        ...base,
        sql: state.ui.sql.query,
        type: "sql",
      };
    } else {
      const model = this.prepareFacetModel(state);
      return {
        ...base,
        type: "facet",
        term: state.ui.search.query,
        model: model,
        parameter: state.ui.search.facets.fieldsWithParameters,
      };
    }
  }

  prepareFacetModel(state: QueryState) {
    return {
      ...state.ui.search.facets.model,
      type: state.ui.search.category,
    };
  }
}
