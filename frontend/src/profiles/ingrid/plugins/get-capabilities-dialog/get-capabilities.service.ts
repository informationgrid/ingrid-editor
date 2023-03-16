import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ConfigService } from "../../../../app/services/config/config.service";

export interface GetCapabilitiesAnalysis {}

@Injectable({
  providedIn: "root",
})
export class GetCapabilitiesService {
  private backendUrl: string;
  constructor(private http: HttpClient, configService: ConfigService) {
    configService.$userInfo.subscribe(
      () => (this.backendUrl = configService.getConfiguration().backendUrl)
    );
  }

  analyze(url: string) {
    return this.http.post<GetCapabilitiesAnalysis>(
      this.backendUrl + "getCapabilities/analyzeGetCapabilities",
      url
    );
  }
}
