import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ConfigService } from "../../../../../services/config/config.service";

@Injectable({
  providedIn: "root",
})
export class GeothesaurusWfsGndeService {
  private http = inject(HttpClient);

  constructor() {}

  search(query: string) {
    return this.http.post(
      ConfigService.backendApiUrl + "search/geothesaurus/wfsgnde",
      query,
    );
  }
}
