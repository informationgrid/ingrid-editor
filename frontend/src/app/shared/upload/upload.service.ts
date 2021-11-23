import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ConfigService } from "../../services/config/config.service";
import { KeycloakService } from "keycloak-angular";

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

  extractUploadedFilesOnServer(docId: string, fileId: string) {
    return this.http.get(`${this.backendUrl}upload/extract/${docId}/${fileId}`);
  }

  async updateAuthenticationToken(flowFiles: flowjs.FlowFile[]) {
    if (this.keycloak.isTokenExpired()) {
      await this.keycloak.updateToken();
    }
    flowFiles.forEach((file) => {
      file.flowObj.opts.headers = {
        Authorization: "Bearer " + this.keycloak.getKeycloakInstance().token,
      };
    });
  }
}
