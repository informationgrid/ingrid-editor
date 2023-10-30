import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {
  ConfigService,
  Configuration,
} from "../../services/config/config.service";
import { Catalog } from "../services/catalog.model";
import { BehaviorSubject, Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { BaseLogResult } from "../../shared/base-log-result";

export interface LogResult extends BaseLogResult {
  numDocuments: number;
  numAddresses: number;
  progressDocuments: number;
  progressAddresses: number;
}

interface IndexConfig {
  catalogId: string;
  cronPattern: string;
  exportFormat: string;
}

@Injectable({
  providedIn: "root",
})
export class IndexService {
  private configuration: Configuration;
  private catalog: Catalog;
  lastLog$ = new BehaviorSubject<LogResult>(null);
  private exportFormat: string;

  constructor(
    private http: HttpClient,
    configService: ConfigService,
  ) {
    this.configuration = configService.getConfiguration();
    this.catalog = configService.$userInfo.getValue().currentCatalog;
  }

  start() {
    return this.http.post(this.configuration.backendUrl + "index", {
      catalogId: this.catalog.id,
      format: this.exportFormat,
    });
  }

  setCronPattern(value: string) {
    return this.http.post(this.configuration.backendUrl + "index/config", {
      catalogId: this.catalog.id,
      cronPattern: value,
      exportFormat: this.exportFormat,
    });
  }

  getIndexConfig(): Observable<IndexConfig> {
    return this.http
      .get<IndexConfig>(
        this.configuration.backendUrl + "index/config/" + this.catalog.id,
      )
      .pipe(tap((config) => (this.exportFormat = config.exportFormat)));
  }

  fetchLastLog() {
    return this.http
      .get<any>(this.configuration.backendUrl + "index/log")
      .pipe(tap((response) => this.lastLog$.next(response)))
      .subscribe();
  }

  cancel() {
    return this.http
      .delete(this.configuration.backendUrl + "index/" + this.catalog.id)
      .subscribe();
  }
}
