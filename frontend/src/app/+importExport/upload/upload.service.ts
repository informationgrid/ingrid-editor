import { Injectable } from "@angular/core";
import {
  HttpClient,
  HttpErrorResponse,
  HttpEventType,
  HttpRequest,
} from "@angular/common/http";
import { catchError, last, map } from "rxjs/operators";
import { FileUploadModel } from "./upload.component";
import { IgeError } from "../../models/ige-error";

@Injectable({
  providedIn: "root",
})
export class UploadService {
  constructor(private _http: HttpClient) {}

  uploadFile(file: FileUploadModel, param, target) {
    const fd = new FormData();
    fd.append(param, file.data);

    const req = new HttpRequest("POST", target, fd, {
      reportProgress: true,
    });

    file.inProgress = true;
    return this._http.request(req).pipe(
      map((event) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            file.progress = Math.round((event.loaded * 100) / event.total);
            break;
          case HttpEventType.Response:
            return event;
        }
      }),
      last(),
      catchError((error: HttpErrorResponse) => {
        file.inProgress = false;
        file.canRetry = true;
        if (error.error.errorText.indexOf("No importer found") !== -1) {
          throw new IgeError(
            "Es wurde kein Importer gefunden, der die Datei importieren könnte"
          );
        }
        throw new IgeError(
          `${file.data.name} upload failed: ${error.error.message}`
        );
      })
    );
  }
}
