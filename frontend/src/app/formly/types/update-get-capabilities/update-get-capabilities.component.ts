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
import { Component } from "@angular/core";
import { FieldType } from "@ngx-formly/material";
import { FieldTypeConfig } from "@ngx-formly/core";
import { GetCapabilitiesDialogComponent } from "./get-capabilities-dialog/get-capabilities-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { GetCapabilitiesService } from "./get-capabilities-dialog/get-capabilities.service";
import { filter } from "rxjs/operators";
import { GetCapabilitiesAnalysis } from "./get-capabilities-dialog/get-capabilities.model";

@Component({
  selector: "ige-update-get-capabilities",
  templateUrl: "./update-get-capabilities.component.html",
  styleUrls: ["./update-get-capabilities.component.scss"],
})
export class UpdateGetCapabilitiesComponent extends FieldType<FieldTypeConfig> {
  constructor(
    private dialog: MatDialog,
    private getCapService: GetCapabilitiesService,
  ) {
    super();
  }
  showDialog() {
    this.dialog
      .open(GetCapabilitiesDialogComponent, {
        minWidth: 700,
        maxWidth: "80vw",
        disableClose: true,
        hasBackdrop: true,
        data: this.getInitialGetCapabilitiesUrl(),
      })
      .afterClosed()
      .pipe(filter((result) => result))
      .subscribe((result) => this.updateDataset(result));
  }

  private async updateDataset(values: GetCapabilitiesAnalysis) {
    await this.getCapService.applyChangesToModel(this.field.model, values);
    this.field.options.formState.updateModel();
    this.form.markAsDirty();
  }

  private getInitialGetCapabilitiesUrl(): string {
    return (
      this.options.formState.mainModel.service.operations?.find(
        (item) => item.name?.key === "1",
      )?.methodCall ?? ""
    );
  }
}
