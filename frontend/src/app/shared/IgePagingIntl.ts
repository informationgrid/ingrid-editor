import { MatLegacyPaginatorIntl as MatPaginatorIntl } from "@angular/material/legacy-paginator";

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
