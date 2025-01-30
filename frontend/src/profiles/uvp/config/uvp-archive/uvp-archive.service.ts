import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ConfigService } from "../../../../app/services/config/config.service";
import { Observable } from "rxjs";

@Injectable()
export class UvpArchiveService {
  private http = inject(HttpClient);
  private configuration = inject(ConfigService).getConfiguration();

  archive(type: string, date: Date): Observable<any> {
    return this.http.post(`${this.configuration.backendUrl}uvp/archive`, {
      type,
      date,
    });
  }
}
