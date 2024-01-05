/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
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
  detailUrl: string;
  searchInCountries = "de";

  constructor(
    private http: HttpClient,
    config: ConfigService,
  ) {
    this.url = config.getConfiguration().nominatimUrl;
    this.detailUrl = config.getConfiguration().nominatimDetailUrl;
  }

  search(query: string): Observable<NominatimResult[]> {
    return this.http.get<NominatimResult[]>(
      this.url
        .replace("{query}", query)
        .replace("{countries}", this.searchInCountries),
    );
  }

  detail(id: number, type: OsmType): Observable<NominatimDetailResult> {
    const mappedType = this.mapOsmType(type);
    return (
      this.http
        .get<NominatimDetailResult>(
          this.detailUrl
            .replace("{type}", mappedType)
            .replace("{id}", id.toString()),
        )
        // just ignore any errors
        .pipe(
          catchError((error) => {
            console.error("Error getting detail of Nominatim Result", error);
            return of(<NominatimDetailResult>{});
          }),
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
