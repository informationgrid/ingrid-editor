import { HttpClient } from "@angular/common/http";
import { ConfigService, Configuration } from "../config/config.service";
import { Injectable } from "@angular/core";
import { CodelistBackend } from "../../store/codelist/codelist.model";

@Injectable({
  providedIn: "root",
})
export class CodelistDataService {
  private configuration: Configuration;

  constructor(
    private http: HttpClient,
    configService: ConfigService,
  ) {
    this.configuration = configService.getConfiguration();
  }

  byIds(ids: string[]) {
    return this.http.get<CodelistBackend[]>(
      this.configuration.backendUrl + "codelist/" + ids.join(","),
    );
  }

  update() {
    return this.http.post<CodelistBackend[]>(
      this.configuration.backendUrl + "codelist",
      null,
    );
  }

  getAll() {
    return this.http.get<CodelistBackend[]>(
      this.configuration.backendUrl + "codelist",
    );
  }

  getCatalogCodelists() {
    return this.http.get<CodelistBackend[]>(
      this.configuration.backendUrl + "codelist/manage",
    );
  }

  updateCodelist(codelist: CodelistBackend) {
    return this.http.put<CodelistBackend[]>(
      this.configuration.backendUrl + "codelist/manage/" + codelist.id,
      codelist,
    );
  }

  resetCodelist(id: string) {
    return this.http.delete<CodelistBackend[]>(
      this.configuration.backendUrl + "codelist/manage/" + id,
    );
  }
}
