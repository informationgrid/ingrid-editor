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
import { signalStore, withMethods } from "@ngrx/signals";
import { withEntities } from "@ngrx/signals/entities";
import { DocumentAbstract } from "../document/document.model";
import {
  getTreeStoreMethods,
  TreeStoreMethods,
  updateTreeStoreDocs,
} from "../tree/tree.base";
import { inject } from "@angular/core";
import { DocumentDataService } from "../../services/document/document-data.service";
import { ProfileService } from "../../services/profile.service";
import { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";

const initialState = {
  active: [],
  openedDocument: null,
  expandedNodes: [],
  breadcrumb: [],
  explicitActiveNode: undefined,
  scrollPosition: 0,
  needsReload: false,
};

export const AddressTreeStore = signalStore(
  { providedIn: "root" },
  withEntities<DocumentAbstract>(),
  withMethods((store) => {
    const dataService = inject(DocumentDataService);
    const profileService = inject(ProfileService);
    return {
      ...getTreeStoreMethods()(store),

      fetchChildren(
        parentId: number,
        hideReadOnly: boolean,
      ): Observable<DocumentAbstract[]> {
        return dataService.getChildren(parentId, true, hideReadOnly).pipe(
          map((docs) => {
            (docs as Array<any>).forEach((doc) => {
              doc.icon = profileService.getDocumentIcon(doc._type);
              if (!doc.title) doc.title = "-Kein Titel-";
              doc.isRoot = parentId === null;
            });
            return docs as DocumentAbstract[];
          }),
          tap((docs) => updateTreeStoreDocs(store, parentId, docs)),
        );
      },
    } satisfies TreeStoreMethods;
  }),
);
