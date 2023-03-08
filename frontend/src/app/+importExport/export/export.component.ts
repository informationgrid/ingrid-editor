import { Component, OnInit, ViewChild } from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
} from "@angular/forms";
import { ExchangeService } from "../exchange.service";
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
import { HttpErrorResponse, HttpResponse } from "@angular/common/http";
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
  exportResult: HttpResponse<Blob>;
  exportFormats = this.exportService
    .getExportTypes()
    .pipe(
      tap((types) => this.optionsFormGroup.get("format").setValue(types[0]))
    );
  path: ShortTreeNode[];
  showMore = false;

  constructor(
    private _formBuilder: UntypedFormBuilder,
    private exportService: ExchangeService,
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
    const options = ExchangeService.prepareExportInfo(
      this.selectedIds[0],
      model
    );
    this.exportResult = null;
    this.exportService
      .export(options)
      .pipe(catchError((error) => this.handleError(error)))
      .subscribe((response: HttpResponse<Blob>) => {
        console.log("Export-Result:", response);
        this.exportResult = response;
      });
  }

  downloadExport() {
    this.downloadFile(this.exportResult);
  }

  private downloadFile(data: HttpResponse<Blob>) {
    const downloadLink = document.createElement("a");
    const filename = this.getFilenameFromHeader(data);
    downloadLink.href = window.URL.createObjectURL(data.body);
    downloadLink.setAttribute("download", filename);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
  }

  private getFilenameFromHeader(data: HttpResponse<Blob>) {
    const content = data.headers.get("Content-Disposition");
    return content.substring(21, content.length - 1);
  }

  cancel() {
    this.stepper.selectedIndex = 0;
    this.treeComponent.jumpToNode(null).then(() => {
      this.datasetSelected = false;
      this.path = null;
    });
  }

  async showPreview() {
    const data = await this.exportResult.body.text();
    this.dialog.open(ConfirmDialogComponent, {
      maxWidth: 700,
      data: {
        title: "Vorschau",
        message: data,
        buttons: [{ text: "Ok", alignRight: true, emphasize: true }],
        preformatted: true,
      } as ConfirmDialogData,
    });
  }

  private handleError(error: HttpErrorResponse): Promise<any> {
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
          const error = JSON.parse((<any>e.target).result);
          resolve(error);
        } catch (e) {
          reject(error);
        }
      };
      reader.onerror = () => {
        reject(error);
      };
      reader.readAsText(error.error);
    });
  }
}
