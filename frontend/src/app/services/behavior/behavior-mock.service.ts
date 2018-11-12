import {Observable} from "rxjs";
import {ConfigService, Configuration} from "../config/config.service";
import {HttpClient} from "@angular/common/http";
import {Behaviour} from "../../+behaviours/behaviours";
import {Plugin} from "../../+behaviours";

export class BehaviorMockService {

  loadStoredBehaviours(): Observable<any> {
    return Observable.of([]);
  }

  saveBehavior(behavior: Behaviour|any): Observable<any> {
    return Observable.of({

    });
  }
}
