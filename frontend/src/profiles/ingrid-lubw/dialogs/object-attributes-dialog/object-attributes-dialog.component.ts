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
import { Component, Inject, inject, signal } from "@angular/core";
import { DialogTemplateComponent } from "../../../../app/shared/dialog-template/dialog-template.component";
import { FormlyFieldConfig, FormlyModule } from "@ngx-formly/core";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";
import { geometryContextFields } from "../../../ingrid-up-sh/dialogs/geometry-context.fields";
import { objectAttributesFields } from "./object-attributes.fields";
import { CodelistService } from "../../../../app/services/codelist/codelist.service";
import { AutocompleteTypeComponent } from "../../../../app/formly/types/autocomplete-type.component";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: "ige-object-attributes-dialog",
  standalone: true,
  imports: [
    DialogTemplateComponent,
    FormlyModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  templateUrl: "./object-attributes-dialog.component.html",
  styleUrl: "./object-attributes-dialog.component.scss",
})
export class ObjectAttributesDialogComponent {
  private codelistService = inject(CodelistService);

  form: FormGroup = new FormGroup<any>({});
  disabled = signal<boolean>(false);

  fields: FormlyFieldConfig[] = objectAttributesFields(
    this.codelistService.observe("30002"),
    this.codelistService.observe("30003"),
    this.codelistService.observe("30004"),
  );

  constructor(
    private dlgRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.form.statusChanges.subscribe((status) => {
      this.disabled.set(status !== "VALID");
    });
  }

  submit() {
    this.dlgRef.close(this.form.value);
  }
}
