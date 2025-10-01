/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {
  ConfigService,
  Configuration,
} from "../services/config/config.service";
import { Observable } from "rxjs";
import { catchError, map, tap } from "rxjs/operators";
import { FacetQuery, Query, SqlQuery } from "../store/query/query.model";
import { BackendQuery } from "./backend-query.model";
import {
  BackendStoreQuery,
  BackendUpdateStoreQuery,
} from "./backend-store-query.model";
import { ProfileService } from "../services/profile.service";
import { SaveQueryDialogResponse } from "./save-query-dialog/save-query-dialog.response";
import { IgeDocument } from "../models/ige-document";
import { IgeError } from "../models/ige-error";
import { QueryStore } from "../store/query/query.store";
import { GeneralStore } from "../store/general.store";
import {
  ExpiredData,
  ExpiredDataset,
} from "../+reports/+tab-expiration/tab-expiration.model";

export interface QuickFilter {
  id: string;
  label: string;
  implicitFilter: string[];
  parameters: any[];
  codelistId?: string;
  codelistIdFromBehaviour?: string;
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
  viewComponent:
    | "CHECKBOX"
    | "RADIO"
    | "DOC_ADDRESS"
    | "SPATIAL"
    | "TIMESPAN"
    | "SELECT";
}

export class ResearchResponse {
  totalHits: number;
  hits: IgeDocument[];
}

@Injectable({
  providedIn: "root",
})
export class ResearchService {
  private queryStore = inject(QueryStore);
  private generalStore = inject(GeneralStore);

  facetModel: any;
  private configuration: Configuration;
  private filters: Facets;
  sqlExamples = [
    {
      label: 'Adressen, mit Titel "test"',
      value: `SELECT document1.*, document_wrapper.category
              FROM document_wrapper
                     JOIN document document1 ON document_wrapper.uuid=document1.uuid
              WHERE document1.is_latest = true AND document_wrapper.category = 'address'
                AND LOWER(title) LIKE '%test%'`,
    },
    {
      label: "Metadatensätze ohne gültige Adressreferenz",
      value: `SELECT document1.*, document_wrapper.category
              FROM document_wrapper
                     JOIN document document1 ON document_wrapper.uuid = document1.uuid
              WHERE document1.is_latest = true
                AND document_wrapper.category = 'data'
                AND document_wrapper.type <> 'FOLDER'
                AND (data ->> 'pointOfContact' IS NULL OR data -> 'pointOfContact' = '[]'\\:\\:jsonb)`,
    },
  ];

  constructor(
    private http: HttpClient,
    configService: ConfigService,
    private profileService: ProfileService,
  ) {
    this.configuration = configService.getConfiguration();
  }

  getQuickFilter(): Observable<Facets> {
    return this.http
      .get<Facets>(`${this.configuration.backendUrl}search/quickFilter`)
      .pipe(
        tap((filters) => (this.filters = filters)),
        tap((filters) => this.createFacetModel(filters)),
      );
  }

  search(
    term: string,
    model: any,
    orderByField = "title",
    orderByDirection = "ASC",
    pagination?: {
      page: number;
      pageSize: number;
    },
    isNotFacetKeys: string[] = [],
  ): Observable<ResearchResponse> {
    // Remove leading and trailing whitespace
    term = term?.trim();
    const backendQuery = new BackendQuery(
      term,
      model,
      this.filters,
      orderByField,
      orderByDirection,
      pagination,
      isNotFacetKeys,
    );
    return this.http
      .post<ResearchResponse>(
        `${this.configuration.backendUrl}search/query`,
        backendQuery.get(),
      )
      .pipe(map((result) => this.mapDocumentIcons(result)));
  }

  searchBySQL(
    sql: string,
    page?: number,
    pageSize?: number,
  ): Observable<ResearchResponse> {
    let paging = "";
    if (page && pageSize) {
      paging = `?page=${page}&pageSize=${pageSize}`;
    }
    return this.http
      .post<ResearchResponse>(
        `${this.configuration.backendUrl}search/querySql${paging}`,
        sql,
      )
      .pipe(map((result) => this.mapDocumentIcons(result)));
  }

  searchStatistic(model: any): Observable<any> {
    const backendQuery = new BackendQuery("", model, this.filters);
    return this.http.post<any>(
      `${this.configuration.backendUrl}statistic/query`,
      backendQuery.get(),
    );
  }

  private expiredDatasetToDocument(exData: ExpiredDataset): IgeDocument {
    return {
      _uuid: exData.uuid,
      title: exData.title,
      _contentModified: exData.contentmodified,
      _type: exData.type,
      _parent: null,
      _category: exData.category,
      _responsibleUser: exData.responsibleUserId,
      // for display purposes. information not passed from backend
      hasWritePermission: true,
    } as IgeDocument;
  }

  getExpiredDatasetStatistics(): Observable<ExpiredData> {
    return this.http
      .get<any>(`${this.configuration.backendUrl}statistic/expiredDatasets`)
      .pipe(
        map((data: ExpiredDataset[]) => {
          return new ExpiredData(
            data
              .filter((d) => d.category == "data")
              .map((item) => this.expiredDatasetToDocument(item)),
            data
              .filter((d) => d.category == "address")
              .map((item) => this.expiredDatasetToDocument(item)),
          );
        }),
      );
  }

  fetchQueries(): void {
    this.http
      .get<BackendStoreQuery[]>(`${this.configuration.backendUrl}search`)
      .pipe(
        map((queries) => queries.map((q) => this.convertToFrontendQuery(q))),
        tap((queries) => this.queryStore.set(queries)),
      )
      .subscribe();
  }

  setActiveQuery(id: string) {
    this.generalStore.setActiveQuery(this.queryStore.entityMap()[id]);
  }

  saveQuery(
    model: any,
    dialogOptions: SaveQueryDialogResponse,
    asSql: boolean,
  ): Observable<SqlQuery | FacetQuery> {
    const preparedQuery = this.prepareQuery(model, dialogOptions, asSql);
    return this.http
      .post<BackendStoreQuery>(
        `${this.configuration.backendUrl}search`,
        this.convertToBackendQuery(preparedQuery),
      )
      .pipe(
        map((response) => this.convertToFrontendQuery(response)),
        tap((response) => this.queryStore.add(response)),
      );
  }

  updateQuery(
    id: number,
    dialogOptions: SaveQueryDialogResponse,
  ): Observable<SqlQuery | FacetQuery> {
    return this.http
      .put<BackendStoreQuery>(
        `${this.configuration.backendUrl}search/query/${id}`,
        this.prepareUpdateQuery(id, dialogOptions),
      )
      .pipe(
        map((response) => this.convertToFrontendQuery(response)),
        tap((response) => this.queryStore.update(id, response)),
      );
  }

  convertToFrontendQuery(query: BackendStoreQuery): SqlQuery | FacetQuery {
    const base = <Query>{
      id: query.id,
      type: query.category,
      name: query.name,
      description: query.description,
      modified: query.modified,
      isCatalogQuery: query.global,
      userId: query.userId,
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
      global: query.isCatalogQuery,
      settings: this.createSettings(query),
    };
  }

  removeQuery(id: string) {
    return this.http
      .delete(`${this.configuration.backendUrl}search/query/${id}`)
      .pipe(tap(() => this.queryStore.remove(id)));
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
          term: query.model.term,
          model: query.model,
        }
      : {
          sql: query.sql,
        };
  }

  mapDocumentIcons(data: ResearchResponse): ResearchResponse {
    data.hits.forEach((hit) => {
      hit.icon = this.profileService.getDocumentIcon(hit._type);
    });
    return data;
  }

  private prepareQuery(
    model: any,
    response: SaveQueryDialogResponse,
    asSql: boolean,
  ): SqlQuery | FacetQuery {
    let base: Partial<Query> = {
      id: null,
      name: response.name,
      description: response.description,
      isCatalogQuery: response.forCatalog,
    };

    if (asSql) {
      return <SqlQuery>{
        ...base,
        sql: model,
        type: "sql",
      };
    } else {
      return <FacetQuery>{
        ...base,
        type: "facet",
        model: model,
      };
    }
  }

  askAI(question: string) {
    return this.http
      .post(`${this.configuration.backendUrl}search/ai`, question, {
        responseType: "text",
      })
      .pipe(
        catchError((error) => {
          throw new IgeError(JSON.parse(error.error)?.errorText);
        }),
      );
  }

  private prepareUpdateQuery(
    id: number,
    data: SaveQueryDialogResponse,
  ): BackendUpdateStoreQuery {
    return {
      id: id,
      name: data.name,
      description: data.description,
      global: data.forCatalog,
    };
  }
}
