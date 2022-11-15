import { Component, Inject, OnDestroy } from "@angular/core";
import { FormlyFormOptions } from "@ngx-formly/core";
import { FormControl, FormGroup } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { CodelistService } from "../../../app/services/codelist/codelist.service";

@Component({
  selector: "ige-conformity-dialog",
  templateUrl: "./conformity-dialog.component.html",
  // styleUrls: ["./form-dialog.component.scss"],
})
export class ConformityDialogComponent implements OnDestroy {
  titleText: string;
  options: FormlyFormOptions = {};
  specifications = this.codelistService.observe("6005");
  level = this.codelistService.observe("6000");
  formGroup: FormGroup;

  constructor(
    private dlgRef: MatDialogRef<any>,
    private codelistService: CodelistService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.titleText = data?.newEntry
      ? "Eintrag hinzufügen"
      : "Eintrag bearbeiten";

    this.formGroup = new FormGroup({
      specification: new FormControl(this.data.model.specification?.key),
      pass: new FormControl(this.data.model.pass?.key),
      Datum: new FormControl(this.data.model.publicationDate),
      verifiedBy: new FormControl(this.data.model.explanation),
      isInspire: new FormControl(this.data.model.isInspire),
    });
  }

  ngOnDestroy(): void {
    this.options.resetModel && this.options.resetModel();
  }

  submit() {
    const value = this.formGroup.value;

    this.dlgRef.close({
      specification: { key: value.specification },
      pass: { key: value.pass },
      publicationDate: value.Datum,
      explanation: value.verifiedBy,
      isInspire: value.isInspire,
    });
  }
}
