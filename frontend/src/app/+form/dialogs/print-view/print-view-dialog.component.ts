import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";
import { Component, Inject } from "@angular/core";
import { UntypedFormGroup } from "@angular/forms";
import { FormlyFormOptions, FormlyModule } from "@ngx-formly/core";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { AngularSplitModule } from "angular-split";
import { MatButtonModule } from "@angular/material/button";
import { NgIf } from "@angular/common";
import {
  MixedCdkDragDropModule,
  MixedDragDropConfig,
} from "angular-mixed-cdk-drag-drop";

@Component({
  templateUrl: "print-view-dialog.component.html",
  styles: [
    `
      mat-button-toggle-group {
        font-size: 14px;
      }
    `,
  ],
  providers: [MixedDragDropConfig],
  imports: [
    MatDialogModule,
    MatIconModule,
    MatButtonToggleModule,
    FormlyModule,
    AngularSplitModule,
    MatButtonModule,
    NgIf,
    MixedCdkDragDropModule,
  ],
  standalone: true,
})
export class PrintViewDialogComponent {
  profile: any;
  form = new UntypedFormGroup({});
  options: FormlyFormOptions = {};
  formCompare = new UntypedFormGroup({});
  compareView = false;

  constructor(
    public dialogRef: MatDialogRef<PrintViewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.options.formState = {
      disabled: true,
      mainModel: data.model,
    };
  }

  print() {
    window.print();
  }
}
