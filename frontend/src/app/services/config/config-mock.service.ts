import {Configuration} from './config.service';
import {of} from 'rxjs';

export class ConfigMockService {

  config: Configuration;

  load(url: string): Promise<any> {
    return of({

    }).toPromise();
  }

  getCurrentUserInfo(): Promise<any> {
    return of({
      assignedCatalogs: ['test-catalog']
    }).toPromise();
  }

}
