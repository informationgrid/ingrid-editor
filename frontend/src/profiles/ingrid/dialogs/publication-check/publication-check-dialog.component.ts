import { Component, inject } from "@angular/core";
import { DialogTemplateComponent } from "../../../../app/shared/dialog-template/dialog-template.component";
import { MatIcon } from "@angular/material/icon";
import { MatRadioButton, MatRadioGroup } from "@angular/material/radio";
import { MatCheckbox } from "@angular/material/checkbox";
import { MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: "ige-publication-check",
  standalone: true,
  imports: [
    DialogTemplateComponent,
    MatIcon,
    MatRadioButton,
    MatRadioGroup,
    MatCheckbox,
  ],
  templateUrl: "./publication-check-dialog.component.html",
  styleUrl: "./publication-check-dialog.component.scss",
})
export class PublicationCheckDialogComponent {
  dlgRef = inject(MatDialogRef<boolean>);
}
