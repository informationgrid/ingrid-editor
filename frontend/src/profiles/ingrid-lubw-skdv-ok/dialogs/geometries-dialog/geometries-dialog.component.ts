import { Component, Inject, inject } from "@angular/core";
import { DialogTemplateComponent } from "../../../../app/shared/dialog-template/dialog-template.component";
import { FormlyFieldConfig, FormlyModule } from "@ngx-formly/core";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";
import { CodelistService } from "../../../../app/services/codelist/codelist.service";
import { objectAttributesFields } from "../object-attributes-dialog/object-attributes.fields";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { geometriesFields } from "./geometries.fields";

@Component({
  selector: "ige-geometries-dialog",
  standalone: true,
  imports: [DialogTemplateComponent, FormlyModule, ReactiveFormsModule],
  templateUrl: "./geometries-dialog.component.html",
  styleUrl: "./geometries-dialog.component.scss",
})
export class GeometriesDialogComponent {
  private codelistService = inject(CodelistService);

  form: FormGroup = new FormGroup<any>({});
  disabled: boolean;

  fields: FormlyFieldConfig[] = geometriesFields(
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
