import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ConfigService, Configuration} from '../../services/config/config.service';
import {Catalog} from '../services/catalog.model';

@Injectable({
  providedIn: 'root'
})
export class IndexService {

  private configuration: Configuration;
  private catalog: Catalog;

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
}
