/**
 * ==================================================
 * Copyright (C) 2025 wemove digital solutions GmbH
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
import { Component, inject } from "@angular/core";
import { DialogTemplateComponent } from "../../../../app/shared/dialog-template/dialog-template.component";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { MatOption, MatSelect } from "@angular/material/select";
import {
  CodelistService,
  SelectOptionUi,
} from "../../../../app/services/codelist/codelist.service";
import { CodelistStore } from "../../../../app/store/codelist/codelist.store";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: "ige-batch-edit-object-attributes",
  imports: [
    DialogTemplateComponent,
    MatFormField,
    MatSelect,
    MatOption,
    MatLabel,
    ReactiveFormsModule,
  ],
  templateUrl: "./batch-edit-object-attributes.component.html",
  styleUrl: "./batch-edit-object-attributes.component.scss",
})
export class BatchEditObjectAttributesComponent {
  codelistStore = inject(CodelistStore);

  dialogRef = inject(MatDialogRef<BatchEditObjectAttributesComponent>);
  categories: SelectOptionUi[] = CodelistService.mapToSelect(
    this.codelistStore.entityMap()["30003"],
  );

  steps: SelectOptionUi[] = CodelistService.mapToSelect(
    this.codelistStore.entityMap()["30004"],
  );

  categoryControl = new FormControl();
  stepControl = new FormControl();

  submit() {
    this.dialogRef.close({
      category: this.categoryControl.value,
      step: this.stepControl.value,
    });
  }
}
