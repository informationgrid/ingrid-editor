import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

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
  url = "https://nominatim.openstreetmap.org";
  searchInCountries = "de";

  constructor(private http: HttpClient) {}

  search(query: string): Observable<NominatimResult[]> {
    return this.http.get<NominatimResult[]>(
      this.url +
        "/search/" +
        query +
        "?format=json&countrycodes=" +
        this.searchInCountries
    );
  }
}
