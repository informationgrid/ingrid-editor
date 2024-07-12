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
import { HttpClient } from "@angular/common/http";
import { ConfigService, Configuration } from "../config/config.service";
import { DocumentWithMetadata, IgeDocument } from "../../models/ige-document";
import { Observable } from "rxjs";
import { Injectable } from "@angular/core";
import { PathResponse } from "../../models/path-response";
import { TagRequest } from "../../models/tag-request.model";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class DocumentDataService {
  private configuration: Configuration;

  constructor(
    private http: HttpClient,
    configService: ConfigService,
  ) {
    configService.$userInfo.subscribe(
      () => (this.configuration = configService.getConfiguration()),
    );
  }

  getChildren(parentId: number, isAddress = false): Observable<any[]> {
    const params = this.createGetChildrenParams(parentId, isAddress);
    const url = `${this.configuration.backendUrl}tree/children` + params;
    return this.http.get<any[]>(url);
  }

  load(id: string | number, useUuid = false): Observable<DocumentWithMetadata> {
    if (useUuid) {
      return this.http
        .get<DocumentWithMetadata>(
          this.configuration.backendUrl + "datasetsByUuid/" + id,
        )
        .pipe(map((data) => this.mapDocumentWithMetadata(data)));
    } else {
      return this.http
        .get<DocumentWithMetadata>(
          this.configuration.backendUrl + "datasets/" + id,
        )
        .pipe(map((data) => this.mapDocumentWithMetadata(data)));
    }
  }

  private mapDocumentWithMetadata(
    data: DocumentWithMetadata,
  ): DocumentWithMetadata {
    data.documentWithMetadata = {
      ...data.document,
      _id: data.metadata.wrapperId,
      _uuid: data.metadata.uuid,
      _type: data.metadata.docType,
      _parent: data.metadata.parentId,
      _created: data.metadata.created,
      _modified: data.metadata.modified,
      _metadataDate: data.metadata.metadataDate,
      _responsibleUser: data.metadata.responsibleUser,
      _contentModified: data.metadata.contentModified,
      _createdBy: data.metadata.createdBy,
      _creatorExists: data.metadata.creatorExists,
      _modifierExists: data.metadata.modifierExists,
      _contentModifiedBy: data.metadata.contentModifiedBy,
      _hasChildren: data.metadata.hasChildren,
      _pendingDate: data.metadata.pendingDate,
      _tags: data.metadata.tags,
      _version: data.metadata.version,
      _state: data.metadata.state,
      hasWritePermission: data.metadata.hasWritePermission,
      hasOnlySubtreeWritePermission:
        data.metadata.hasOnlySubtreeWritePermission,
    };
    return data;
  }

  loadPublished(id: string, useUuid = false): Observable<DocumentWithMetadata> {
    if (useUuid) {
      return this.http.get<DocumentWithMetadata>(
        this.configuration.backendUrl +
          "datasetsByUuid/" +
          id +
          "?publish=true",
      );
    } else {
      return this.http
        .get<DocumentWithMetadata>(
          this.configuration.backendUrl + "datasets/" + id + "?publish=true",
        )
        .pipe(map((data) => this.mapDocumentWithMetadata(data)));
    }
  }

  save(
    id: number,
    version: number,
    data: IgeDocument,
    isAddress?: boolean,
  ): Observable<DocumentWithMetadata> {
    const params = isAddress ? "&address=true" : "";
    if (id != null) {
      return this.http
        .put<DocumentWithMetadata>(
          `${this.configuration.backendUrl}datasets/${id}?version=${version}${params}`,
          data,
        )
        .pipe(map((data) => this.mapDocumentWithMetadata(data)));
    } else {
      return this.http
        .post<DocumentWithMetadata>(
          `${this.configuration.backendUrl}datasets?type=${data._type}${params}`,
          data,
        )
        .pipe(map((data) => this.mapDocumentWithMetadata(data)));
    }
  }

  publish(
    id: number,
    version: number,
    data: IgeDocument,
    publishDate: Date = null,
  ): Observable<DocumentWithMetadata> {
    let parameters = "&publish=true";
    if (publishDate != null)
      parameters += "&publishDate=" + publishDate.toISOString();
    if (id === null) {
      return this.http
        .post<DocumentWithMetadata>(
          `${this.configuration.backendUrl}datasets?type=${data._type}${parameters}`,
          data,
        )
        .pipe(map((data) => this.mapDocumentWithMetadata(data)));
    } else {
      return this.http
        .put<DocumentWithMetadata>(
          `${this.configuration.backendUrl}datasets/${id}?version=${version}${parameters}`,
          data,
        )
        .pipe(map((data) => this.mapDocumentWithMetadata(data)));
    }
  }

  unpublish(id: number): Observable<DocumentWithMetadata> {
    return this.http
      .put<DocumentWithMetadata>(
        this.configuration.backendUrl + "datasets/" + id + "?unpublish=true",
        {},
      )
      .pipe(map((data) => this.mapDocumentWithMetadata(data)));
  }

  cancelPendingPublishing(id: number): Observable<any> {
    return this.http.put(
      this.configuration.backendUrl +
        "datasets/" +
        id +
        "?cancelPendingPublishing=true",
      {},
    );
  }

  delete(ids: number[]): Observable<any> {
    return this.http.delete(this.configuration.backendUrl + "datasets/" + ids);
  }

  revert(id: number): Observable<IgeDocument> {
    return this.http.put<IgeDocument>(
      this.configuration.backendUrl + "datasets/" + id + "?revert=true",
      {},
    );
  }

  getPath(id: number): Observable<PathResponse[]> {
    return this.http.get<PathResponse[]>(
      this.configuration.backendUrl + "datasets/" + id + "/path",
    );
  }

  copy(
    srcIDs: number[],
    dest: number,
    includeTree: boolean,
  ): Observable<DocumentWithMetadata[]> {
    const body = this.prepareCopyCutBody(dest, includeTree);
    return this.http
      .post<DocumentWithMetadata[]>(
        this.configuration.backendUrl +
          "datasets/" +
          srcIDs.join(",") +
          "/copy",
        body,
      )
      .pipe(
        map((data) => {
          return data.map((doc) => this.mapDocumentWithMetadata(doc));
        }),
      );
  }

  move(srcIDs: number[], dest: number) {
    const body = this.prepareCopyCutBody(dest, true);
    return this.http.post(
      this.configuration.backendUrl + "datasets/" + srcIDs.join(",") + "/move",
      body,
    );
  }

  updateTags(id: number, data: TagRequest) {
    return this.http.put(
      `${this.configuration.backendUrl}datasets/${id}/tags`,
      data,
    );
  }

  private prepareCopyCutBody(dest: number, includeTree: boolean): any {
    return {
      // srcIds: src,
      destId: dest,
      includeTree: includeTree,
    };
  }

  private createGetChildrenParams(
    parentId: number,
    isAddress: boolean,
  ): string {
    let params = "";
    if (parentId) {
      params += `?parentId=${parentId}`;
    }
    if (isAddress) {
      params += params.length > 0 ? "&" : "?";
      params += "address=true";
    }
    return params;
  }
}
