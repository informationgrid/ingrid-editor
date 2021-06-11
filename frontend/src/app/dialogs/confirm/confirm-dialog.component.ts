import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Component, Inject } from "@angular/core";

export interface ConfirmDialogData {
  title: string;
  message: string;
  list?: string[];
  confirmText?: string;
  buttons?: ConfirmDialogButton[];
}

export interface ConfirmDialogButton {
  id?: string;
  text: string;
  emphasize?: boolean;
  alignRight?: boolean;
  disabledWhenNotConfirmed?: boolean;
}

@Component({
  templateUrl: "confirm-dialog.component.html",
})
export class ConfirmDialogComponent {
  textConfirmed: string;
  leftAlignedButtons: ConfirmDialogButton[] = [{ text: "Abbrechen" }];
  rightAlignedButtons: ConfirmDialogButton[] = [
    { text: "Ok", id: "ok", emphasize: true },
  ];

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {
    if (data.buttons) {
      this.leftAlignedButtons = data.buttons.filter(
        (button) => !button.alignRight
      );
      this.rightAlignedButtons = data.buttons.filter(
        (button) => button.alignRight
      );
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
