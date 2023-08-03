import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ConfigService } from "../../../services/config/config.service";

export interface NominatimResult {
  display_name: string;
  boundingbox: string[];
  lat: string;
  lon: string;
  class: string;
  type: string;
}

@Injectable({
  providedIn: "root",
})
export class NominatimService {
  url: string;
  searchInCountries = "de";

  constructor(private http: HttpClient, config: ConfigService) {
    this.url = config.getConfiguration().nominatimUrl;
  }

  search(query: string): Observable<NominatimResult[]> {
    return this.http.get<NominatimResult[]>(
      this.url
        .replace("{query}", query)
        .replace("{countries}", this.searchInCountries)
    );
  }
}
