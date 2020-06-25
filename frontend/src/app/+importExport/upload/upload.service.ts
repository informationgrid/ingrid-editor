import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpEventType, HttpRequest} from '@angular/common/http';
import {catchError, last, map} from 'rxjs/operators';
import {FileUploadModel} from './upload.component';
import {of} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadService {


  constructor(private _http: HttpClient) {
  }

  uploadFile(file: FileUploadModel, param, target) {
    const fd = new FormData();
    fd.append(param, file.data);

    const req = new HttpRequest('POST', target, fd, {
      reportProgress: true
    });

    file.inProgress = true;
    return this._http.request(req).pipe(
      map(event => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            file.progress = Math.round(event.loaded * 100 / event.total);
            break;
          case HttpEventType.Response:
            return event;
        }
      }),
      last(),
      catchError((error: HttpErrorResponse) => {
        file.inProgress = false;
        file.canRetry = true;
        return of(`${file.data.name} upload failed: ${error.error.message}`);
      })
    );
  }

}
