/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
import { Component, OnInit, ViewChild } from "@angular/core";
import {
  FormControl,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
} from "@angular/forms";
import { ExchangeService } from "../exchange.service";
import { catchError, finalize, tap } from "rxjs/operators";
import {
  MatStep,
  MatStepLabel,
  MatStepper,
  MatStepperNext,
  MatStepperPrevious,
} from "@angular/material/stepper";
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
import { MatSelect, MatSelectChange } from "@angular/material/select";
import { TranslocoDirective } from "@ngneat/transloco";
import { PageTemplateComponent } from "../../shared/page-template/page-template.component";
import { FeatureFlagDirective } from "../../directives/feature-flag.directive";
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatTooltip } from "@angular/material/tooltip";
import { MatIcon } from "@angular/material/icon";
import { MatDivider } from "@angular/material/divider";
import { BreadcrumbComponent } from "../../+form/form-info/breadcrumb/breadcrumb.component";
import { MatFormField } from "@angular/material/form-field";
import { MatOption } from "@angular/material/core";
import { MatCheckbox } from "@angular/material/checkbox";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { AsyncPipe } from "@angular/common";

@Component({
  selector: "ige-export",
  templateUrl: "./export.component.html",
  styleUrls: ["./export.component.scss"],
  standalone: true,
  imports: [
    TranslocoDirective,
    PageTemplateComponent,
    FeatureFlagDirective,
    MatIconButton,
    MatTooltip,
    MatIcon,
    MatStepper,
    MatStep,
    MatStepLabel,
    TreeComponent,
    MatDivider,
    MatButton,
    MatStepperNext,
    ReactiveFormsModule,
    BreadcrumbComponent,
    MatFormField,
    MatSelect,
    MatOption,
    MatCheckbox,
    MatStepperPrevious,
    MatProgressSpinner,
    AsyncPipe,
  ],
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
      tap((types) => this.optionsFormGroup.get("format").setValue(types[0])),
    );
  path: ShortTreeNode[];
  showMore = false;
  showDraftsCheckbox = true;
  exportFinished = false;

  constructor(
    private _formBuilder: UntypedFormBuilder,
    private exportService: ExchangeService,
    private docService: DocumentService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.optionsFormGroup = this._formBuilder.group({
      option: new FormControl("dataset"),
      drafts: new FormControl<boolean>(false),
      addressReferences: new FormControl<boolean>(false),
      format: new FormControl(),
    });
  }

  selectDatasets(ids: number[]) {
    this.selectedIds = ids;
    if (ids.length > 0) {
      this.datasetSelected = true;
      // only get path if exactly one dataset is selected
      ids.length == 1
        ? this.docService
            .getPath(ids[0])
            .subscribe((path) => (this.path = path))
        : (this.path = null);
    }
  }

  runExport() {
    let model = this.optionsFormGroup.value;
    const options = ExchangeService.prepareExportInfo(this.selectedIds, model);
    this.exportResult = null;
    this.exportFinished = false;
    this.exportService
      .export(options)
      .pipe(
        catchError((error) => this.handleError(error)),
        finalize(() => (this.exportFinished = true)),
      )
      .subscribe((response: HttpResponse<Blob>) => {
        console.debug("Export-Result:", response);
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
          "Es können nur veröffentlichte Versionen exportiert werden.",
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

  updateDraftsCheckbox($event: MatSelectChange) {
    this.showDraftsCheckbox = $event.value.type === "internal";
    // this.optionsFormGroup.get("drafts").setValue(false);
  }
}
