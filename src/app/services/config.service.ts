import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export class Configuration {
  constructor(public keykloakBaseUrl: string, public backendUrl: string) {}
}

@Injectable()
export class ConfigService {

  private config: Configuration;

  constructor(private http: HttpClient) {}

  load(url: string) {
    console.log('=== ConfigService ===');

    return new Promise((resolve) => {
      this.http.get<Configuration>(url).subscribe(config => {
        this.config = config;
        resolve();
      });
    });
  }

  getConfiguration(): Configuration {
    return this.config;
  }
}
