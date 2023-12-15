/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
import { Component, Inject, ViewChild } from "@angular/core";
import { GetCapabilitiesService } from "./get-capabilities.service";
import { catchError, filter, finalize, tap } from "rxjs/operators";
import { Observable, of, Subscription } from "rxjs";
import { MatSelectionList } from "@angular/material/list";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog";
import { GetCapabilitiesAnalysis } from "./get-capabilities.model";
import {
  PasteDialogComponent,
  PasteDialogOptions,
} from "../../../../+form/dialogs/copy-cut-paste/paste-dialog.component";
import { DocumentService } from "../../../../services/document/document.service";
import { ShortTreeNode } from "../../../../+form/sidebars/tree/tree.types";
import { ConfigService } from "../../../../services/config/config.service";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";

@UntilDestroy()
@Component({
  selector: "ige-get-capabilities-dialog",
  templateUrl: "./get-capabilities-dialog.component.html",
  styleUrls: ["./get-capabilities-dialog.component.scss"],
})
export class GetCapabilitiesDialogComponent {
  @ViewChild(MatSelectionList) selection: MatSelectionList;

  report: GetCapabilitiesAnalysis;
  error: string;
  isAnalyzing = false;
  allChecked = false;
  addressPath: ShortTreeNode[] = [];
  hasWriteRootPermission = this.config.hasWriteRootPermission();
  private parentAddress = null;
  validAddressConstraint = true;
  private selectSubsription: Subscription;
  addressSelected = false;

  constructor(
    private getCapService: GetCapabilitiesService,
    @Inject(MAT_DIALOG_DATA) public initialUrl: string,
    private dlg: MatDialogRef<GetCapabilitiesDialogComponent>,
    private dialog: MatDialog,
    private documentService: DocumentService,
    private config: ConfigService,
  ) {
    if (initialUrl) this.analyze(initialUrl);
  }

  handleSelectionChange() {
    if (this.selectSubsription) this.selectSubsription.unsubscribe();

    this.selectSubsription = this.selection.selectionChange
      .pipe(untilDestroyed(this))
      .subscribe(() => this.handleAddressConstraint());
  }

  analyze(url: string) {
    this.report = null;
    this.error = null;
    this.isAnalyzing = true;
    this.getCapService
      .analyze(url)
      .pipe(
        catchError((error) => this.handleError(error)),
        filter((report) => report !== null),
        finalize(() => (this.isAnalyzing = false)),
      )
      .subscribe((report) => {
        this.report = this.addOriginalGetCapabilitiesUrl(report, url);
        // delay to give time for selection-list to be initialized
        setTimeout(() => this.handleSelectionChange());
      });
  }

  private handleError(error: any): Observable<null> {
    this.error = error.message;
    return of(null);
  }

  submit() {
    const selectedValues = this.selection.selectedOptions.selected.map(
      (item) => item.value,
    );
    selectedValues.push("dataServiceType", "serviceType");
    let result = Object.fromEntries(
      Object.entries(this.report).filter(
        ([key]) => selectedValues.indexOf(key) !== -1,
      ),
    );
    result.addressParent = this.parentAddress;
    this.dlg.close(result);
  }

  toggleAll(checked: boolean) {
    this.allChecked = checked;
    if (checked) this.selection.selectAll();
    else this.selection.deselectAll();

    // we need to manually trigger the following function, since selectAll/deselectAll does not emit selectionChange-event!
    this.handleAddressConstraint();
  }

  private handleAddressConstraint() {
    this.addressSelected = this.selection.selectedOptions.selected.some(
      (item) => item.value === "address",
    );
    this.validAddressConstraint =
      !this.addressSelected ||
      this.report.address.exists ||
      this.hasWriteRootPermission ||
      this.parentAddress !== null;
  }

  private addOriginalGetCapabilitiesUrl(
    report: GetCapabilitiesAnalysis,
    originalUrl: string,
  ) {
    const getCapOp = report.operations.find(
      (item) => item.name.key === "1" || item.name.value === "GetCapabilities",
    );

    getCapOp.addressList = getCapOp.addressList.map(() => originalUrl);
    return report;
  }

  changeAddressLocation() {
    this.dialog
      .open(PasteDialogComponent, {
        data: <PasteDialogOptions>{
          forAddress: true,
          titleText: "Ordner auswählen",
          typeToInsert: "InGridOrganisationDoc",
          buttonText: "Auswählen",
        },
      })
      .afterClosed()
      .subscribe((target) => {
        this.parentAddress = target.selection ?? null;
        this.handleAddressConstraint();
        if (this.parentAddress === null) {
          this.addressPath = [];
        } else {
          this.documentService
            .getPath(this.parentAddress)
            .pipe(tap((result) => (this.addressPath = result)))
            .subscribe();
        }
      });
  }
}
