import { HttpClient } from "@angular/common/http";
import { ConfigService, Configuration } from "../config/config.service";
import { IgeDocument } from "../../models/ige-document";
import { Observable } from "rxjs";
import { Injectable } from "@angular/core";
import { PathResponse } from "../../models/path-response";

@Injectable({
  providedIn: "root",
})
export class DocumentDataService {
  private configuration: Configuration;

  constructor(private http: HttpClient, configService: ConfigService) {
    configService.$userInfo.subscribe(
      () => (this.configuration = configService.getConfiguration())
    );
  }

  getChildren(parentId: string, isAddress = false): Observable<any[]> {
    const params = this.createGetChildrenParams(parentId, isAddress);
    const url = `${this.configuration.backendUrl}tree/children` + params;
    return this.http.get<any[]>(url);
  }

  load(id: string, address = false): Observable<IgeDocument> {
    const params = "?address=" + address;
    return this.http.get<IgeDocument>(
      this.configuration.backendUrl + "datasets/" + id + params
    );
  }

  save(data: IgeDocument, isAddress?: boolean): Observable<any> {
    const params = isAddress ? "?address=true" : "";
    if (data._id) {
      return this.http.put(
        this.configuration.backendUrl + "datasets/" + data._id + params,
        data
      );
    } else {
      return this.http.post(
        this.configuration.backendUrl + "datasets" + params,
        data
      );
    }
  }

  publish(data: IgeDocument): Observable<any> {
    if (data._id === undefined) {
      return this.http.post(
        this.configuration.backendUrl + "datasets?publish=true",
        data
      );
    } else {
      return this.http.put(
        this.configuration.backendUrl +
          "datasets/" +
          data._id +
          "?publish=true",
        data
      );
    }
  }

  delete(ids: string[]): Observable<any> {
    return this.http.delete(this.configuration.backendUrl + "datasets/" + ids, {
      responseType: "text",
    });
  }

  revert(id: string): Observable<any> {
    return this.http.put(
      this.configuration.backendUrl + "datasets/" + id + "?revert=true",
      {}
    );
  }

  getPath(id: string): Observable<PathResponse[]> {
    return this.http.get<PathResponse[]>(
      this.configuration.backendUrl + "datasets/" + id + "/path"
    );
  }

  copy(
    srcIDs: string[],
    dest: string,
    includeTree: boolean
  ): Observable<IgeDocument[]> {
    const body = this.prepareCopyCutBody(dest, includeTree);
    return this.http.post<IgeDocument[]>(
      this.configuration.backendUrl + "datasets/" + srcIDs.join(",") + "/copy",
      body
    );
  }

  move(srcIDs: string[], dest: string) {
    const body = this.prepareCopyCutBody(dest, true);
    return this.http.post(
      this.configuration.backendUrl + "datasets/" + srcIDs.join(",") + "/move",
      body
    );
  }

  private prepareCopyCutBody(dest: string, includeTree: boolean): any {
    const body = {
      // srcIds: src,
      destId: dest,
      includeTree: includeTree,
    };
    return body;
  }

  private createGetChildrenParams(
    parentId: string,
    isAddress: boolean
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
