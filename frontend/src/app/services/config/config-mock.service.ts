import {Configuration} from "./config.service";
import {Observable} from "rxjs";

export class ConfigMockService {

  config: Configuration;

  load(url: string): Promise<any> {
    return Observable.of({

    }).toPromise();
  }

  getCurrentUserInfo(): Promise<any> {
    return Observable.of({
      assignedCatalogs: ['test-catalog']
    }).toPromise();
  }

}
