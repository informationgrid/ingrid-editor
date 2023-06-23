import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { ConfigService } from "../../../services/config/config.service";
import { catchError } from "rxjs/operators";

type OsmType = "node" | "relation" | "way";

export interface NominatimResult {
  display_name: string;
  boundingbox: string[];
  lat: string;
  lon: string;
  class: string;
  type: string;
  osm_id: number;
  osm_type: OsmType;
}

export interface NominatimDetailResult {
  extratags: {
    "de:regionalschluessel": string;
  };
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
      this.url +
        "/search/" +
        query +
        "?format=json&countrycodes=" +
        this.searchInCountries
    );
  }

  detail(id: number, type: OsmType): Observable<NominatimDetailResult> {
    const mappedType = this.mapOsmType(type);
    return (
      this.http
        .get<NominatimDetailResult>(
          `${this.url}/details?osmtype=${mappedType}&osmid=${id}&format=json`
        )
        // just ignore any errors
        .pipe(
          catchError((error) => {
            console.error("Error getting detail of Nominatim Result", error);
            return of(<NominatimDetailResult>{});
          })
        )
    );
  }

  private mapOsmType(type: OsmType): "N" | "R" | "W" {
    switch (type) {
      case "node":
        return "N";
      case "relation":
        return "R";
      case "way":
        return "W";
    }
  }
}
