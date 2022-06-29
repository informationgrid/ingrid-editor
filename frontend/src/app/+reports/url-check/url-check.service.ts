import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ConfigService } from "../../services/config/config.service";
import { Observable } from "rxjs";
import { BaseLogResult } from "../../shared/base-log-result";

export interface UrlLogResult extends BaseLogResult {}

@Injectable({
  providedIn: "root",
})
export class UrlCheckService {
  private backendURL = this.config.getConfiguration().backendUrl;

  constructor(private http: HttpClient, private config: ConfigService) {}

  start(): Observable<void> {
    return this.sendCommand("start");
  }

  stop(): Observable<void> {
    return this.sendCommand("stop");
  }

  private sendCommand(command: "start" | "stop") {
    return this.http.post<void>(
      `${this.backendURL}jobs/url-check?command=${command}`,
      null
    );
  }

  isRunning(): Observable<boolean> {
    return this.http.get<boolean>(
      this.backendURL + "jobs/url-check/is-running"
    );
  }
}
