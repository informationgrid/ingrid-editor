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
import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ConfigService } from "../../../../../services/config/config.service";
import { Observable, of } from "rxjs";
import { SpatialBoundingBox } from "../spatial-result.model";
import { BwastrSection } from "../../spatial-list/spatial-list.component";
import { CodelistService } from "../../../../../services/codelist/codelist.service";
import { toSignal } from "@angular/core/rxjs-interop";
import { map } from "rxjs/operators";
import { CodelistEntry } from "../../../../../store/codelist/codelist.model";

@Injectable({
  providedIn: "root",
})
export class BwastrLocatorService {
  private http = inject(HttpClient);
  private codelistService = inject(CodelistService);

  private bwaStrIds = toSignal(this.codelistService.observeRaw("bwastrids"));

  search(query: string): Observable<BwastrLocatorSearchResponse[]> {
    const entry = this.searchInCodelist(query);
    const codelistBwastr: BwastrLocatorSearchResponse = entry
      ? {
          bwastrid: entry.id,
          concatName: entry.fields.de,
          start: null,
          end: null,
        }
      : null;

    return this.http
      .post<
        BwastrLocatorSearchResponse[]
      >(ConfigService.backendApiUrl + "search/bwastr", query)
      .pipe(
        map((res) => {
          return codelistBwastr ? [codelistBwastr, ...res] : res;
        }),
      );
  }

  getSectionCoordinates(
    section: BwastrSection,
  ): Observable<BwastrLocatorCoordinatesResponse> {
    const entry = this.searchInCodelist(section.bwastrid);
    if (entry) {
      try {
        const bounds: SpatialBoundingBox = JSON.parse(entry.data);
        return of(<BwastrLocatorCoordinatesResponse>{
          coordinates: this.boundsToCoordinates(bounds),
          bounds: bounds,
        });
      } catch (e) {
        // throw new IgeError("Could not parse bounds: " + entry.data);
        return of(null);
      }
    }
    return this.http.post<BwastrLocatorCoordinatesResponse>(
      ConfigService.backendApiUrl + "search/bwastr/coordinates",
      section,
    );
  }

  private searchInCodelist(query: string): CodelistEntry {
    return this.bwaStrIds()?.entries?.find(
      (item) => item.id === query || item.fields.de.indexOf(query) !== -1,
    );
  }

  private boundsToCoordinates(bounds: SpatialBoundingBox): number[][][] {
    const { lat1, lon1, lat2, lon2 } = bounds;

    return [
      [
        [lon1, lat1],
        [lon2, lat1],
        [lon2, lat2],
        [lon1, lat2],
        [lon1, lat1],
      ],
    ];
  }
}

export interface BwastrLocatorSearchResponse {
  bwastrid: string;
  concatName: string;
  start: number;
  end: number;
}

export interface BwastrLocatorCoordinatesResponse {
  coordinates: number[][][];
  bounds: SpatialBoundingBox;
}
