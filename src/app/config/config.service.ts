import { Injectable } from '@angular/core';

export class HttpOrig {
  get(url: string): any {}
}

export class Configuration {
  constructor(public keykloakBaseUrl: string, public backendUrl: string) {}
}

@Injectable()
export class ConfigService {

  private config: Configuration;

  constructor(private http: HttpOrig) {}

  load(url: string) {
    console.log('=== ConfigService ===');

    return new Promise((resolve) => {
      this.http.get(url).map(res => res.json())
        .subscribe(config => {
          this.config = config;
          resolve();
        });
    });
  }

  getConfiguration(): Configuration {
    return this.config;
  }
}
