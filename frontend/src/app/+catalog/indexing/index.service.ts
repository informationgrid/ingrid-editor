import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ConfigService, Configuration} from '../../services/config/config.service';
import {Catalog} from '../services/catalog.model';
import {BehaviorSubject} from 'rxjs';
import {tap} from 'rxjs/operators';

export interface LogResult {
  startTime: Date;
  endTime: Date;
  numDocuments: number;
  numAddresses: number;
  progressDocuments: number;
  progressAddresses: number;
  message: string;
  errors: string[];
}

@Injectable({
  providedIn: 'root'
})
export class IndexService {

  private configuration: Configuration;
  private catalog: Catalog;
  lastLog$ = new BehaviorSubject<LogResult>(null);

  constructor(private http: HttpClient, configService: ConfigService) {
    this.configuration = configService.getConfiguration();
    this.catalog = configService.$userInfo.getValue().currentCatalog;
  }

  start() {
    return this.http.post(this.configuration.backendUrl + 'index', {
      catalogId: this.catalog.id,
      format: 'portal'
    });
  }

  setCronPattern(value: string) {
    return this.http.post(this.configuration.backendUrl + 'index/config', {
      catalogId: this.catalog.id,
      cronPattern: value
    });
  }

  getCronPattern() {
    return this.http.get<any>(this.configuration.backendUrl + 'index/config/' + this.catalog.id);
  }

  fetchLastLog() {
    return this.http.get<any>(this.configuration.backendUrl + 'index/log')
      .pipe(
        tap(response => this.lastLog$.next(response))
      ).subscribe();
  }
}
