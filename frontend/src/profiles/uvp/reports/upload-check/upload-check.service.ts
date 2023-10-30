import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ConfigService } from "../../../../app/services/config/config.service";

@Injectable({
  providedIn: "root",
})
export class UploadCheckService {
  constructor(
    private http: HttpClient,
    private config: ConfigService,
  ) {}

  analyse() {
    return this.http.get(
      `${this.config.getConfiguration().backendUrl}uvp/upload-check`,
    );
  }
}
