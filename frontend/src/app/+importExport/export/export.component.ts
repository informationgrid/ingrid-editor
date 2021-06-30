import { Component, OnInit, ViewChild } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { ExportTypeInfo, ImportExportService } from "../import-export-service";
import { tap } from "rxjs/operators";
import { MatStepper } from "@angular/material/stepper";
import { ShortTreeNode } from "../../+form/sidebars/tree/tree.types";
import { DocumentService } from "../../services/document/document.service";

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
    .pipe(tap((types) => (this.formatSelection = types[0])));
  formatSelection: Partial<ExportTypeInfo>;
  path: ShortTreeNode[];

  constructor(
    private _formBuilder: FormBuilder,
    private exportService: ImportExportService,
    private docService: DocumentService
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
    const options = ImportExportService.prepareExportInfo(
      this.selectedIds[0],
      this.formatSelection.type,
      this.optionsFormGroup.value
    );
    this.exportService.export(options).subscribe((response) => {
      console.log("Export-Result:", response);
      response.text().then((text) => (this.exportResult = text));
      this.downloadFile(
        response,
        this.formatSelection.dataType,
        this.formatSelection.fileExtension
      );
    });
  }

  downloadFile(data: Blob, dataType: string, fileExtension: string = "json") {
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
}
