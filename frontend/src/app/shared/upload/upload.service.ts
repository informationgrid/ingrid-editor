/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { ConfigService } from "../../services/config/config.service";
import { KeycloakService } from "keycloak-angular";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { IgeError } from "../../models/ige-error";

export type ExtractOption = "RENAME" | "REPLACE";

export class UploadError {
  status: number;
  message: string;
  data: any;

  constructor(status: number, message: string, data: any) {
    this.status = status;
    this.message = this.translate(status, message);
    this.data = data;
  }

  translate(status: number, message: string) {
    switch (status) {
      case 401:
        return "Sie haben keine Berechtigung, die Datei hochzuladen.";
    }

    switch (message) {
      case "The file already exists.":
        return "Die Datei existiert bereits.";
      default:
        return message;
    }
  }
}

@Injectable({
  providedIn: "root",
})
export class UploadService {
  private backendUrl: string;

  constructor(
    private http: HttpClient,
    configService: ConfigService,
    private keycloak: KeycloakService,
  ) {
    this.backendUrl = configService.getConfiguration().backendUrl;
  }

  deleteUploadedFile(docId: string, fileId: string) {
    this.http.delete(`${this.backendUrl}upload/${docId}/${fileId}`).subscribe();
  }

  extractUploadedFilesOnServer(
    docId: string,
    fileId: string,
    option?: ExtractOption,
  ) {
    const requestOptions = option ? `?conflict=${option}` : "";
    return this.http.get(
      `${this.backendUrl}upload/extract/${docId}/${fileId}${requestOptions}`,
    );
  }

  async updateAuthenticationToken(flowFiles: flowjs.FlowFile[]) {
    const keycloakInstance = this.keycloak.getKeycloakInstance();
    if (!keycloakInstance) {
      return;
    }

    if (this.keycloak.isTokenExpired(5)) {
      await this.keycloak.updateToken();
    }
    flowFiles.forEach((file) => {
      file.flowObj.opts.headers = {
        ...file.flowObj.opts.headers,
        Authorization: "Bearer " + keycloakInstance.token,
      };
    });
  }

  downloadFile(docUuid: string, uri: string, $event: MouseEvent) {
    $event.stopImmediatePropagation();
    $event.stopPropagation();
    $event.preventDefault();

    let start = uri.lastIndexOf("/") + 1;
    const filename = uri.substring(start);
    uri = this.preEncodeUri(uri);
    this.getFile(docUuid, uri)
      .pipe(catchError((error) => this.handleDownloadError(error)))
      .subscribe((data) => this.handleDownloadProcess(data, filename));
  }

  /**
   * Manually encodes '+' and '%' as they are not otherwise.
   * Necessary because of angular bug.
   * See Ticket https://github.com/angular/angular/issues/11058
   * @param uri
   */
  preEncodeUri(uri: string): string {
    return uri.replace("%", "%25").replace("+", "%2B");
  }

  private handleDownloadProcess(hash: String, filename: string) {
    const downloadLink = document.createElement("a");
    downloadLink.href = `${this.backendUrl}upload/download/${hash}`;
    downloadLink.setAttribute("download", filename);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
  }

  getFile(docUuid: string, uri: string): Observable<String> {
    return this.http.get(`${this.backendUrl}upload/${docUuid}/${uri}`, {
      responseType: "text",
    });
  }

  private handleDownloadError(error: HttpErrorResponse): Observable<String> {
    const message =
      error.status === 404
        ? "Die Datei konnte nicht gefunden werden"
        : error.message;
    throw new IgeError(message);
  }
}
