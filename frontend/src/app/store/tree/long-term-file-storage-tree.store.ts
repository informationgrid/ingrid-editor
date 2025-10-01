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
import { Observable } from "rxjs";
import { catchError, map, tap } from "rxjs/operators";
import { inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { IgeError } from "../../models/ige-error";
import { ConfigService } from "../../services/config/config.service";

export const LongTermFileStorageTreeStore = signalStore(
  { providedIn: "root" },
  withEntities<DocumentAbstract>(),
  withMethods((store) => {
    const http = inject(HttpClient);
    const config = inject(ConfigService);

    return {
      ...getTreeStoreMethods()(store),

      fetchChildren(parentId: string): Observable<DocumentAbstract[]> {
        return getLongTermFileStorageChildren(
          http,
          config.getConfiguration().lfsInterfaceUrl,
          parentId,
        ).pipe(
          map((docs) => {
            (docs as Array<any>).forEach((doc) => {
              if (!doc.title) doc.title = "-Kein Titel-";
              doc.isRoot = parentId === null;
            });
            return docs as DocumentAbstract[];
          }),
          tap((docs: DocumentAbstract[]) =>
            updateTreeStoreDocs(store, parentId, docs),
          ),
        );
      },
    } satisfies TreeStoreMethods;
  }),
);

function getLongTermFileStorageChildren(
  http: HttpClient,
  lfsInterfaceUrl: string,
  parentPath: string,
): Observable<Partial<DocumentAbstract>[]> {
  if (!lfsInterfaceUrl)
    throw new Error("Configuration missing: LFS_INTERFACE_URL is not defined");
  const url = `${lfsInterfaceUrl}?folder=${parentPath ?? ""}`;
  return http
    .get<{ name: string; type: "container" | "object" | string }[]>(url)
    .pipe(
      catchError((err) => {
        throw new IgeError(
          err,
          "Abfrage an Langzeitspeicher (LFS) ist fehlgeschlagen.",
        );
      }),
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
