import {Observable} from "rxjs";
import {ConfigService, Configuration} from "../config/config.service";
import {HttpClient} from "@angular/common/http";
import {Behaviour} from "../../+behaviours/behaviours";
import {Plugin} from "../../+behaviours";

export class BehaviorDataService {

  private configuration: Configuration;

  constructor(private http: HttpClient, configService: ConfigService) {
    this.configuration = configService.getConfiguration();
  }

  loadStoredBehaviours(): Observable<any> {
    return this.http.get<any[]>( this.configuration.backendUrl + 'behaviours' );
  }

  saveBehavior(behavior: Behaviour|any): Observable<any> {
    return this.http.post(this.configuration.backendUrl + 'behaviours', behavior)
  }
}
