import {Injectable} from '@angular/core';

@Injectable()
export class ConfigService {

  backendUrl: string = 'http://localhost:8080/v1/';

  constructor() {
  }
}