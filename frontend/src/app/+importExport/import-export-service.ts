import {
  ConfigService,
  Configuration,
} from "../services/config/config.service";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { FileUploadModel } from "../shared/upload/fileUploadModel";

export type ExportMethod = "dataset" | "belowDataset" | "datasetAndBelow";

export interface ExportOptions {
  id: number;
  method: ExportMethod;
  exportFormat: string;
  useDraft: boolean;
}

export interface ExportFormOptions {
  option: ExportMethod;
  drafts: boolean;
  format: any;
}

export interface ExportTypeInfo {
  type: string;
  name: string;
  description: string;
  dataType: string;
  fileExtension: string;
}

export interface ImportTypeInfo {
  id: string;
  name: string;
  description: string;
}

export interface ImportAnalyzeResponse {
  importer: string[];
  existingDatasets: string[];
}

export interface UploadAnalysis {
  file: FileUploadModel;
  analysis: ImportAnalyzeResponse;
}

@Injectable({
  providedIn: "root",
})
export class ImportExportService {
  private configuration: Configuration;
  private catalogType: string;

  public static prepareExportInfo(
    docId: number,
    options: ExportFormOptions
  ): ExportOptions {
    return {
      id: docId,
      method: options.option,
      exportFormat: options.format.type,
      useDraft: options.drafts,
    };
  }

  constructor(private http: HttpClient, configService: ConfigService) {
    this.configuration = configService.getConfiguration();
    this.catalogType = configService.$userInfo.getValue().currentCatalog.type;
  }

  import(file: File): Observable<any> {
    return this.http.post(this.configuration.backendUrl + "import", file);
  }

  export(options: ExportOptions): Observable<Blob> {
    return this.http.post(this.configuration.backendUrl + "export", options, {
      responseType: "blob",
    });
  }

  getExportTypes(): Observable<ExportTypeInfo[]> {
    return this.http.get<ExportTypeInfo[]>(
      this.configuration.backendUrl + "export?profile=" + this.catalogType
    );
  }

  getImportTypes(): Observable<ImportTypeInfo[]> {
    return this.http.get<ImportTypeInfo[]>(
      this.configuration.backendUrl + "import?profile=mcloud" + this.catalogType
    );
  }
}
