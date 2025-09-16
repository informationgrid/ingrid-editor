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
import {
  getTreeStoreMethods,
  TreeStoreMethods,
  updateTreeStoreDocs,
} from "./tree.base";
import { Observable, of } from "rxjs";
import { catchError, map, tap } from "rxjs/operators";
import { inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";

// TODO Adapt http request to intranet source e.g. apiUrl, authentication?
// TODO apiUrl auslagern nach ?
export const LongTermFileStorageTreeStore = signalStore(
  { providedIn: "root" },
  withEntities<DocumentAbstract>(),
  withMethods((store) => {
    const http = inject(HttpClient);
    return {
      ...getTreeStoreMethods()(store),

      fetchChildren(parentId: string): Observable<DocumentAbstract[]> {
        return getLongTermFileStorageChildren(http, parentId).pipe(
          map((docs) => {
            console.log("document.service get children:", docs);
            (docs as Array<any>).forEach((doc) => {
              if (!doc.title) doc.title = "-Kein Titel-";
              doc.isRoot = parentId === null;
            });
            return docs as DocumentAbstract[];
          }),
          tap((docs: DocumentAbstract[]) =>
            updateTreeStoreDocs(store, null, docs),
          ),
        );
      },
    } satisfies TreeStoreMethods;
  }),
);

function getLongTermFileStorageChildren(
  http: HttpClient,
  parentPath: string,
): Observable<Partial<DocumentAbstract>[]> {
  const apiUrl = "http://localhost:3001/isibaw/api/list";
  const url = `${apiUrl}?folder=${parentPath}`;
  const fallback: {
    name: string;
    type: "container" | "object" | string;
  }[] = [
    { name: "0800", type: "container" },
    { name: "0701", type: "container" },
    { name: "0702", type: "container" },
    { name: "id2name_1.txt", type: "object" },
    { name: "id2name_2.txt", type: "object" },
  ];
  return http
    .get<{ name: string; type: "container" | "object" | string }[]>(url)
    .pipe(
      catchError(() => of(fallback)),
      map((items) =>
        items.map((item) => ({
          id: parentPath ? `${parentPath}/${item.name}` : item.name,
          _uuid: parentPath ? `${parentPath}/${item.name}` : item.name,
          _type: item.type === "container" ? "FOLDER" : "ExternalFileReference",
          _hasChildren: item.type === "container",
          title: item.name,
          icon: item.type === "container" ? null : "ExternalFileReference",
          isAddress: false,
          _parent: null,
          _modified: null,
          _contentModified: null,
          _pendingDate: null,
          _tags: null,
          _state: "P",
          isExternalRef: true,
        })),
      ),
    );
}
