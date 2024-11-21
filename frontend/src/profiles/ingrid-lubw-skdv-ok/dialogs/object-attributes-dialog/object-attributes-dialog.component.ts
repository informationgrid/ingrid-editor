import { Component, Inject, inject } from "@angular/core";
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
  disabled: boolean;

  fields: FormlyFieldConfig[] = objectAttributesFields(
    this.codelistService.observe("30002"),
    this.codelistService.observe("30003"),
    this.codelistService.observe("30004"),
  );

  constructor(
    private dlgRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  submit() {
    this.dlgRef.close(this.form.value);
  }
}
