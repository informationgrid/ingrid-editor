/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
import { Codelist, CodelistEntry } from "./codelist.model";
import { patchState, signalStore, withMethods } from "@ngrx/signals";
import {
  addEntities,
  setEntities,
  updateEntity,
  withEntities,
} from "@ngrx/signals/entities";
import { IgeError } from "../../models/ige-error";
import { ConfigService } from "../../services/config/config.service";

export const CodelistStore = signalStore(
  { providedIn: "root" },
  withEntities<Codelist>(),
  withMethods((store) => ({
    addCodelists(codelists: Codelist[]): void {
      patchState(store, addEntities(codelists));
    },
    setCodelists(codelists: Codelist[]): void {
      patchState(store, setEntities(codelists));
    },
    updateCodelist(codelist: Codelist): void {
      patchState(store, updateEntity({ id: codelist.id, changes: codelist }));
    },

    getCodelistEntryValueByKey(
      codelistId: string,
      entryKey: string,
      defaultValue?: string,
    ): string {
      const codelist = this._getCodelist(codelistId);
      const entryFields = codelist.entries.find(
        (entry) => entry.id === entryKey,
      )?.fields;

      return entryFields
        ? entryFields[ConfigService.catalogLanguage]
        : (defaultValue ?? "");
    },

    getCodelistEntryByKey(codelistId: string, entryKey: string): CodelistEntry {
      return this._getCodelist(codelistId)?.entries?.find(
        (entry) => entry.id === entryKey,
      );
    },

    getCodelistEntryByValue(
      codelistId: string,
      value: string,
      field: string,
      caseSensitive: boolean = true,
    ): CodelistEntry {
      return this._getCodelist(codelistId)?.entries?.find((entry) => {
        const entryValue = entry.fields[field];
        if (caseSensitive) {
          return entryValue === value;
        } else {
          return entryValue?.toLowerCase() === value.toLowerCase();
        }
      });
    },
    _getCodelist(codelistId: string): Codelist {
      const entities = store.entityMap()[codelistId];
      if (!entities)
        throw new IgeError(
          `Die Codeliste konnte nicht gefunden werden: ${codelistId}`,
        );
      return entities;
    },

    selectRepoCodelists() {
      return store.entities().filter((entry: Codelist) => !entry.isCatalog);
    },
  })),
);
