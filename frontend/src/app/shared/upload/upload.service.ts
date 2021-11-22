import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class UploadService {
  constructor(private http: HttpClient) {}

  deleteUploadedFile(docId: string, fileId: string) {
    this.http.delete(`api/upload/${docId}/${fileId}`).subscribe();
  }
}
