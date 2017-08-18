import {Injectable} from '@angular/core';

@Injectable()
export class ConfigService {

  // backendUrl = 'http://localhost:8081/v1/';
  backendUrl = 'http://ige-ng.informationgrid.eu/mongo-server/v1/';

  constructor() {
  }
}
