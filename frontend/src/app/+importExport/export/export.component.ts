import { Component, OnInit, ViewChild } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { ImportExportService } from "../import-export-service";
import { tap } from "rxjs/operators";
import { MatStepper } from "@angular/material/stepper";
import { ShortTreeNode } from "../../+form/sidebars/tree/tree.types";
import { DocumentService } from "../../services/document/document.service";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../dialogs/confirm/confirm-dialog.component";
import { MatDialog } from "@angular/material/dialog";

@Component({
  selector: "ige-export",
  templateUrl: "./export.component.html",
  styleUrls: ["./export.component.scss"],
})
export class ExportComponent implements OnInit {
  @ViewChild("stepper") stepper: MatStepper;

  selection: any[] = [];
  optionsFormGroup: FormGroup;
  datasetSelected = false;
  private selectedIds: string[];
  exportResult: any;
  exportFormats = this.exportService
    .getExportTypes()
    .pipe(
      tap((types) => this.optionsFormGroup.get("format").setValue(types[0]))
    );
  path: ShortTreeNode[];
  showMore = false;

  constructor(
    private _formBuilder: FormBuilder,
    private exportService: ImportExportService,
    private docService: DocumentService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.optionsFormGroup = this._formBuilder.group({
      tree: ["dataset", Validators.required],
      option: new FormControl({ value: "dataset", disabled: true }),
      drafts: new FormControl(),
      format: new FormControl(),
    });
  }

  handleSelected(nodes) {
    this.selection = nodes;
  }

  selectDatasets(ids: string[]) {
    this.datasetSelected = true;
    this.selectedIds = ids;
    if (ids.length > 0) {
      this.docService.getPath(ids[0]).subscribe((path) => (this.path = path));
    }
  }

  runExport() {
    let model = this.optionsFormGroup.value;
    const options = ImportExportService.prepareExportInfo(
      this.selectedIds[0],
      model.format.type,
      model
    );
    this.exportService.export(options).subscribe((response) => {
      console.log("Export-Result:", response);
      response.text().then((text) => (this.exportResult = text));
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
    this.datasetSelected = false;
  }

  showPreview() {
    this.dialog.open(ConfirmDialogComponent, {
      maxWidth: 700,
      data: {
        title: "Vorschau",
        message: this.exportResult,
        buttons: [{ text: "Ok", alignRight: true, emphasize: true }],
      } as ConfirmDialogData,
    });
  }
}
