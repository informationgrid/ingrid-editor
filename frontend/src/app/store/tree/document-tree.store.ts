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
import { DocumentAbstract } from "../document/document.model";
import { signalStore, withMethods } from "@ngrx/signals";
import { withEntities } from "@ngrx/signals/entities";
import { getTreeStoreMethods } from "./tree.base";
import { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";
import { inject } from "@angular/core";
import { DocumentDataService } from "../../services/document/document-data.service";
import { ProfileService } from "../../services/profile.service";

export const DocumentTreeStore = signalStore(
  { providedIn: "root" },
  withEntities<DocumentAbstract>(),
  withMethods((store) => {
    const dataService = inject(DocumentDataService);
    const profileService = inject(ProfileService);
    return {
      ...getTreeStoreMethods()(store),

      fetchMoreChildren(
        parentId: number | string,
      ): Observable<DocumentAbstract[]> {
        return dataService.getChildren(parentId as number, false).pipe(
          map((docs) => {
            (docs as Array<any>).forEach((doc) => {
              doc.icon = profileService.getDocumentIcon(doc._type);
              if (!doc.title) doc.title = "-Kein Titel-";
              doc.isRoot = parentId === null;
            });
            return docs as DocumentAbstract[];
          }),
          tap((docs) => this.updateTreeStoreDocs(parentId as number, docs)),
        );
      },

      updateTreeStoreDocs(parentId: number, docs: DocumentAbstract[]) {
        if (parentId === null) {
          getTreeStoreMethods()(store).set(docs);
        } else {
          getTreeStoreMethods()(store).add(docs);
        }
      },
    };
  }),
);
