import { Component, OnInit, ViewChild } from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
} from "@angular/forms";
import { ImportExportService } from "../import-export-service";
import { catchError, tap } from "rxjs/operators";
import { MatStepper } from "@angular/material/stepper";
import { ShortTreeNode } from "../../+form/sidebars/tree/tree.types";
import { DocumentService } from "../../services/document/document.service";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../dialogs/confirm/confirm-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { IgeError } from "../../models/ige-error";
import { HttpErrorResponse } from "@angular/common/http";
import { IgeException } from "../../server-validation.util";
import { TreeComponent } from "../../+form/sidebars/tree/tree.component";

@Component({
  selector: "ige-export",
  templateUrl: "./export.component.html",
  styleUrls: ["./export.component.scss"],
})
export class ExportComponent implements OnInit {
  @ViewChild("stepper") stepper: MatStepper;
  @ViewChild("treeComponent") treeComponent: TreeComponent;

  selection: any[] = [];
  optionsFormGroup: UntypedFormGroup;
  datasetSelected = false;
  private selectedIds: number[];
  exportResult: any;
  exportFormats = this.exportService
    .getExportTypes()
    .pipe(
      tap((types) => this.optionsFormGroup.get("format").setValue(types[0]))
    );
  path: ShortTreeNode[];
  showMore = false;
  exportSuccess = false;

  constructor(
    private _formBuilder: UntypedFormBuilder,
    private exportService: ImportExportService,
    private docService: DocumentService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.optionsFormGroup = this._formBuilder.group({
      option: new UntypedFormControl("dataset"),
      drafts: new UntypedFormControl(),
      format: new UntypedFormControl(),
    });
  }

  handleSelected(nodes) {
    this.selection = nodes;
  }

  selectDatasets(ids: number[]) {
    this.selectedIds = ids;
    if (ids.length > 0) {
      this.datasetSelected = true;
      this.docService.getPath(ids[0]).subscribe((path) => (this.path = path));
    }
  }

  runExport() {
    let model = this.optionsFormGroup.value;
    const options = ImportExportService.prepareExportInfo(
      this.selectedIds[0],
      model
    );
    this.exportService
      .export(options)
      .pipe(catchError((error) => this.handleError(error)))
      .subscribe((response) => {
        console.log("Export-Result:", response);
        response.text().then((text) => (this.exportResult = text));
        this.exportSuccess = true;
      });
  }

  downloadExport() {
    let model = this.optionsFormGroup.value;
    this.downloadFile(
      this.exportResult,
      model.format.dataType,
      model.format.fileExtension
    );
  }

  private downloadFile(
    data: Blob,
    dataType: string,
    fileExtension: string = "json"
  ) {
    const downloadLink = document.createElement("a");
    downloadLink.href = window.URL.createObjectURL(
      new Blob([data], { type: dataType })
    );
    downloadLink.setAttribute("download", `export.${fileExtension}`);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
  }

  cancel() {
    this.stepper.selectedIndex = 0;
    this.treeComponent.jumpToNode(null).then(() => {
      this.datasetSelected = false;
      this.path = null;
    });
  }

  showPreview() {
    this.dialog.open(ConfirmDialogComponent, {
      maxWidth: 700,
      data: {
        title: "Vorschau",
        message: this.exportResult,
        buttons: [{ text: "Ok", alignRight: true, emphasize: true }],
        preformatted: true,
      } as ConfirmDialogData,
    });
  }

  private handleError(error: HttpErrorResponse): Promise<any> {
    this.exportSuccess = false;

    return this.getErrorFromBlob(error).then((jsonError: IgeException) => {
      if (jsonError.errorCode === "PUBLISHED_VERSION_NOT_FOUND") {
        throw new IgeError(
          "Veröffentlichte Version existiert nicht! In den Optionen können Sie auch Entwürfe exportieren."
        );
      }
      throw new IgeError(jsonError.errorText);
    });
  }

  private getErrorFromBlob(error: HttpErrorResponse) {
    return new Promise<any>((resolve, reject) => {
      let reader = new FileReader();
      reader.onload = (e: Event) => {
        try {
          const errmsg = JSON.parse((<any>e.target).result);
          resolve(errmsg);
        } catch (e) {
          reject(error);
        }
      };
      reader.onerror = (e) => {
        reject(error);
      };
      reader.readAsText(error.error);
    });
  }
}
