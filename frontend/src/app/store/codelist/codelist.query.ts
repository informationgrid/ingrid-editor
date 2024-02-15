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
import { QueryEntity } from "@datorama/akita";
import { CodelistState, CodelistStore } from "./codelist.store";
import { Codelist, CodelistEntry } from "./codelist.model";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class CodelistQuery extends QueryEntity<CodelistState, Codelist> {
  selectRepoCodelists = this.selectAll({
    filterBy: (item) => !item.isCatalog,
  });

  constructor(protected store: CodelistStore) {
    super(store);
  }

  getFavorite(id: string): CodelistEntry[] {
    return (
      this.getValue().favorites[id]?.map((entryId) =>
        this.getEntity(id).entries.find((entry) => entry.id === entryId),
      ) ?? []
    );
  }

  getCodelistEntryValueByKey(
    codelistId: string,
    entryKey: string,
    defaultValue?: string,
  ) {
    const entities = this.getValue().entities[codelistId];
    const entryFields = entities.entries.find((entry) => entry.id === entryKey)
      ?.fields;

    return entryFields ? entryFields["de"] : defaultValue ?? "";
  }

  getCodelistEntryByKey(codelistId: string, entryKey: string): CodelistEntry {
    const entities = this.getValue().entities[codelistId];
    return entities?.entries?.find((entry) => entry.id === entryKey);
  }

  getCodelistEntryIdByValue(
    codelistId: string,
    value: string,
    field: string,
  ): string {
    const entities = this.getValue().entities[codelistId];
    return entities?.entries?.find((entry) => entry.fields[field] === value)
      ?.id;
  }

  getCodelistEntryByValue(
    codelistId: string,
    value: string,
    field: string,
  ): CodelistEntry {
    const entities = this.getValue().entities[codelistId];
    return entities?.entries?.find((entry) => entry.fields[field] === value);
  }
}
