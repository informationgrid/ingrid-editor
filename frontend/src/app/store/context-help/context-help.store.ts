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
import { patchState, signalStore, withMethods } from "@ngrx/signals";
import { addEntity, withEntities } from "@ngrx/signals/entities";
import { ContextHelpAbstract } from "./context-help.model";

export const ContextHelpStore = signalStore(
  { providedIn: "root" },
  withEntities<ContextHelpAbstract>(),
  withMethods((store) => ({
    add(help: ContextHelpAbstract): void {
      const id = this._getId(help.profile, help.docType, help.fieldId);
      patchState(store, addEntity({ ...help, id: id }));
    },
    get(
      profile: string,
      docType: string,
      fieldId: string,
    ): ContextHelpAbstract {
      const id = this._getId(profile, docType, fieldId);
      return store.entityMap()[id];
    },
    _getId(profile: string, docType: string, fieldId: string): string {
      return [profile, docType, fieldId].join("_");
    },
  })),
);
