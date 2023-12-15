/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
import { Observable, of } from "rxjs";

export class CodelistMockService {
  byId(id: string): Observable<any> {
    return of({
      entries: [
        {
          id: 1,
          localisations: [["de", "Codelist Wert 1"]],
        },
        {
          id: 2,
          localisations: [["de", "Codelist Wert 2"]],
        },
        {
          id: 3,
          localisations: [["de", "Codelist Wert 3"]],
        },
      ],
    });
  }
}
