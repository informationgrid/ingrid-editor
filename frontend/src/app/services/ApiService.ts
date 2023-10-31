import { Injectable } from "@angular/core";
import { ConfigService, Configuration } from "./config/config.service";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ApiService {
  private configuration: Configuration;

  constructor(
    private http: HttpClient,
    configService: ConfigService,
  ) {
    this.configuration = configService.getConfiguration();
  }

  getIsoDocument(id: number): Observable<any> {
    return this.http.get(
      this.configuration.backendUrl + "datasets/" + id + "/export/ISO",
      { responseType: "text" },
    );
    // .pipe( catchError( error => this.errorService.handle( error ) ) );
  }

  logout() {
    return this.http.get(this.configuration.backendUrl + "logout");
  }
}
