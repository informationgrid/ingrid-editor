import { HttpClient } from "@angular/common/http";
import { ConfigService, Configuration } from "../config/config.service";
import { IgeDocument } from "../../models/ige-document";
import { Observable } from "rxjs";
import { Injectable } from "@angular/core";
import { PathResponse } from "../../models/path-response";
import { TagRequest } from "../../models/tag-request.model";

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

  load(id: string | number, useUuid = false): Observable<IgeDocument> {
    if (useUuid) {
      return this.http.get<IgeDocument>(
        this.configuration.backendUrl + "datasetsByUuid/" + id,
      );
    } else {
      return this.http.get<IgeDocument>(
        this.configuration.backendUrl + "datasets/" + id,
      );
    }
  }

  loadPublished(id: string, useUuid = false): Observable<IgeDocument> {
    if (useUuid) {
      return this.http.get<IgeDocument>(
        this.configuration.backendUrl +
          "datasetsByUuid/" +
          id +
          "?publish=true",
      );
    } else {
      return this.http.get<IgeDocument>(
        this.configuration.backendUrl + "datasets/" + id + "?publish=true",
      );
    }
  }

  save(data: IgeDocument, isAddress?: boolean): Observable<any> {
    const params = isAddress ? "?address=true" : "";
    if (data._id) {
      return this.http.put(
        this.configuration.backendUrl + "datasets/" + data._id + params,
        data,
      );
    } else {
      return this.http.post(
        this.configuration.backendUrl + "datasets" + params,
        data,
      );
    }
  }

  publish(data: IgeDocument, publishDate: Date = null): Observable<any> {
    let parameters = "?publish=true";
    if (publishDate != null)
      parameters += "&publishDate=" + publishDate.toISOString();
    if (data._id === undefined) {
      return this.http.post(
        this.configuration.backendUrl + "datasets" + parameters,
        data,
      );
    } else {
      return this.http.put(
        this.configuration.backendUrl + "datasets/" + data._id + parameters,
        data,
      );
    }
  }

  unpublish(id: number): Observable<any> {
    return this.http.put(
      this.configuration.backendUrl + "datasets/" + id + "?unpublish=true",
      {},
    );
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

  revert(id: string): Observable<IgeDocument> {
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
  ): Observable<IgeDocument[]> {
    const body = this.prepareCopyCutBody(dest, includeTree);
    return this.http.post<IgeDocument[]>(
      this.configuration.backendUrl + "datasets/" + srcIDs.join(",") + "/copy",
      body,
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
