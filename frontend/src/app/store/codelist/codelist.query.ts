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
import { Injectable } from "@angular/core";
import { QueryEntity } from "@datorama/akita";
import { CodelistState, CodelistStore } from "./codelist.store";
import { Codelist, CodelistEntry } from "./codelist.model";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class CodelistQuery extends QueryEntity<CodelistState, Codelist> {
  catalogCodelists$ = this.select((state) => state.catalogCodelists);
  hasCatalogCodelists$ = this.select((state) => state.catalogCodelists).pipe(
    map((codelists) => codelists.length > 0),
  );

  constructor(protected store: CodelistStore) {
    super(store);
  }

  selectCatalogCodelist(id: string): Observable<Codelist> {
    return this.select((state) => state.catalogCodelists).pipe(
      map((codelists) => codelists.filter((cl) => cl.id === id)[0]),
    );
  }

  getCatalogCodelist(id: string): Codelist {
    return this.getValue().catalogCodelists.find((cl) => cl.id === id);
  }

  getCodelistEntryValueByKey(
    codelistId: string,
    entryKey: string,
    defaultValue?: string,
  ) {
    const entities =
      this.getCatalogCodelist(codelistId) ??
      this.getValue().entities[codelistId];
    const entryFields = entities.entries.find((entry) => entry.id === entryKey)
      ?.fields;

    return entryFields ? entryFields["de"] : defaultValue ?? "";
  }

  getCodelistEntryByKey(codelistId: string, entryKey: string): CodelistEntry {
    const entities =
      this.getCatalogCodelist(codelistId) ??
      this.getValue().entities[codelistId];
    return entities?.entries?.find((entry) => entry.id === entryKey);
  }

  getCodelistEntryIdByValue(
    codelistId: string,
    value: string,
    field: string,
  ): string {
    const entities =
      this.getCatalogCodelist(codelistId) ??
      this.getValue().entities[codelistId];
    return entities?.entries?.find((entry) => entry.fields[field] === value)
      ?.id;
  }

  getCodelistEntryByValue(
    codelistId: string,
    value: string,
    field: string,
  ): CodelistEntry {
    const entities =
      this.getCatalogCodelist(codelistId) ??
      this.getValue().entities[codelistId];
    return entities?.entries?.find((entry) => entry.fields[field] === value);
  }
}
