import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ConfigService } from "../../services/config/config.service";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class UrlCheckService {
  private backendURL = this.config.getConfiguration().backendUrl;

  constructor(private http: HttpClient, private config: ConfigService) {}

  start(): Observable<void> {
    return this.http.post<void>(
      this.backendURL + "jobs/system:urlChecker?command=start",
      null
    );
  }
}
