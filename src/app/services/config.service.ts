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

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.overrideMimeType('application/json');
      xhr.open('GET', url, true);
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            this.config = JSON.parse(xhr.responseText);
            resolve();
          } else {
            reject(`Could not load file '${url}': ${xhr.status}`);
          }
        }
      };
      xhr.send(null);
    });
  }

  getConfiguration(): Configuration {
    return this.config;
  }
}
