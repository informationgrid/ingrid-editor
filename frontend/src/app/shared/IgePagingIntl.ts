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
import { MatPaginatorIntl } from "@angular/material/paginator";

export class IgePagingIntl extends MatPaginatorIntl {
  itemsPerPageLabel = "Anzeige";
  nextPageLabel = "Nächste Seite";
  previousPageLabel = "Vorherige Seite";
  lastPageLabel = "Letzte Seite";
  firstPageLabel = "Erste Seite";

  getRangeLabel = function (page, pageSize, length) {
    if (length === 0 || pageSize === 0) {
      return "0 von " + length;
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    // If the start index exceeds the list length, do not try and fix the end index to the end.
    const endIndex =
      startIndex < length
        ? Math.min(startIndex + pageSize, length)
        : startIndex + pageSize;
    return startIndex + 1 + " - " + endIndex + " von " + length;
  };
}
