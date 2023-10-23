import { Observable } from "rxjs";
import { ConfigService, Configuration } from "../config/config.service";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviourFormatBackend } from "./behaviour.service";

@Injectable({
  providedIn: "root",
})
export class BehaviorDataService {
  private configuration: Configuration;

  constructor(
    private http: HttpClient,
    configService: ConfigService,
  ) {
    this.configuration = configService.getConfiguration();
  }

  loadStoredBehaviours(): Observable<any[]> {
    return this.http.get<any[]>(this.configuration.backendUrl + "behaviours");
  }

  saveBehaviors(behavior: BehaviourFormatBackend[]): Observable<any> {
    return this.http.post(
      this.configuration.backendUrl + "behaviours",
      behavior,
    );
  }
}
