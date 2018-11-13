import {Observable, of} from "rxjs";
import {Behaviour} from "../../+behaviours/behaviours";

export class BehaviorMockService {

  loadStoredBehaviours(): Observable<any> {
    return of([]);
  }

  saveBehavior(behavior: Behaviour|any): Observable<any> {
    return of({

    });
  }
}
