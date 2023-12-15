/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
import {
  ConfigService,
  Configuration,
} from "../services/config/config.service";
import { Injectable } from "@angular/core";
import { HttpClient, HttpResponse } from "@angular/common/http";
import { BehaviorSubject, Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { TreeStore } from "../store/tree/tree.store";
import { AddressTreeStore } from "../store/address-tree/address-tree.store";

export interface ImportLog<Type> {
  isRunning: boolean;
  info: Type;
}

export interface LogInfo<Type> {
  startTime: string;
  endTime: string;
  errors: string[];

  infos: string[];
  report: Type;
  progress?: number;
}

export interface ImportLogInfo extends LogInfo<ImportLogReport> {
  stage: "ANALYZE" | "IMPORT";
}

export interface ImportLogReport {
  importers: string[];
  references: DocumentAnalysis[];
  numDatasets: number;
  numAddresses: number;
  existingDatasets: DatasetInfo[];
  existingAddresses: DatasetInfo[];
  importResult: Counter;
}

interface Counter {
  documents: number;
  addresses: number;
  overwritten: number;
  skipped: number;
}

export interface DocumentAnalysis {
  document: any;
  wrapperId: number;
  isAddress: boolean;
  exists: boolean;
  references: DocumentAnalysis[];
}

export interface DatasetInfo {
  title: string;
  type: string;
  uuid: string;
}

export interface ExportOptions {
  id: number;
  exportFormat: string;
  useDraft: boolean;
}

export interface ExportFormOptions {
  drafts: boolean;
  format: any;
}

export interface ExportTypeInfo {
  type: string;
  name: string;
  description: string;
  dataType: string;
  fileExtension: string;
}

export interface ImportTypeInfo {
  id: string;
  name: string;
  description: string;
}

@Injectable({
  providedIn: "root",
})
export class ExchangeService {
  private configuration: Configuration;
  private catalogType: string;

  lastLog$ = new BehaviorSubject<ImportLog<ImportLogInfo>>(null);

  public static prepareExportInfo(
    docId: number,
    options: ExportFormOptions,
  ): ExportOptions {
    return {
      id: docId,
      exportFormat: options.format.type,
      useDraft: options.drafts,
    };
  }

  constructor(
    private http: HttpClient,
    configService: ConfigService,
    private treeStore: TreeStore,
    private addressTreeStore: AddressTreeStore,
  ) {
    this.configuration = configService.getConfiguration();
    this.catalogType = configService.$userInfo.getValue().currentCatalog.type;
  }

  analyze(file: File): Observable<any> {
    return this.http.post(this.configuration.backendUrl + "import", file);
  }

  export(options: ExportOptions): Observable<HttpResponse<Blob>> {
    return this.http.post(this.configuration.backendUrl + "export", options, {
      responseType: "blob",
      observe: "response",
    });
  }

  getExportTypes(): Observable<ExportTypeInfo[]> {
    return this.http.get<ExportTypeInfo[]>(
      this.configuration.backendUrl + "export?profile=" + this.catalogType,
    );
  }

  getImportTypes(): Observable<ImportTypeInfo[]> {
    return this.http.get<ImportTypeInfo[]>(
      this.configuration.backendUrl + "import?profile=" + this.catalogType,
    );
  }

  import(options: any) {
    return this.http
      .post(
        this.configuration.backendUrl + "jobs/import?command=start",
        options,
      )
      .pipe(
        tap(() => {
          this.treeStore.update({ needsReload: true });
          this.addressTreeStore.update({ needsReload: true });
        }),
      );
  }

  fetchLastLog() {
    return this.http
      .get<any>(this.configuration.backendUrl + "jobs/import/info")
      .pipe(tap((response) => this.lastLog$.next(response)))
      .subscribe();
  }

  stopJob() {
    return this.http
      .post(this.configuration.backendUrl + "jobs/import?command=stop", {})
      .subscribe();
  }
}
