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
    private keycloak: KeycloakService
  ) {
    this.backendUrl = configService.getConfiguration().backendUrl;
  }

  deleteUploadedFile(docId: string, fileId: string) {
    this.http.delete(`${this.backendUrl}upload/${docId}/${fileId}`).subscribe();
  }

  extractUploadedFilesOnServer(
    docId: string,
    fileId: string,
    option?: ExtractOption
  ) {
    const requestOptions = option ? `?conflict=${option}` : "";
    return this.http.get(
      `${this.backendUrl}upload/extract/${docId}/${fileId}${requestOptions}`
    );
  }

  async updateAuthenticationToken(flowFiles: flowjs.FlowFile[]) {
    const keycloakInstance = this.keycloak.getKeycloakInstance();
    if (!keycloakInstance) {
      return;
    }

    if (this.keycloak.isTokenExpired()) {
      await this.keycloak.updateToken();
    }
    flowFiles.forEach((file) => {
      file.flowObj.opts.headers = {
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
    this.getFile(docUuid, uri)
      .pipe(catchError((error) => this.handleDownloadError(error)))
      .subscribe((data) => this.handleDownloadProcess(data, filename));
  }

  private handleDownloadProcess(data: Blob, filename: string) {
    const downloadLink = document.createElement("a");
    downloadLink.href = window.URL.createObjectURL(new Blob([data]));
    downloadLink.setAttribute("download", filename);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
  }

  private getFile(docUuid: string, uri: string): Observable<Blob> {
    return this.http.get<Blob>(`${this.backendUrl}upload/${docUuid}/${uri}`, {
      responseType: "blob" as "json",
    });
  }

  private handleDownloadError(error: HttpErrorResponse): Observable<Blob> {
    const message =
      error.status === 404
        ? "Die Datei konnte nicht gefunden werden"
        : error.message;
    throw new IgeError(message);
  }
}
