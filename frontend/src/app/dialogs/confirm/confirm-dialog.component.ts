import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {Component, Inject} from '@angular/core';

export interface ConfirmDialogData {
  title: string;
  message: string;
  list?: string[];
  confirmText?: string;
  acceptButtonText?: string;
  cancelButtonText?: string;
  reverseButtonOrder?: boolean;
  buttons?: ConfirmDialogButton[];
}

export interface ConfirmDialogButton {
  buttonText: string;
  dialogClose?: any;
}

@Component( {
  templateUrl: 'confirm-dialog.component.html'
} )
export class ConfirmDialogComponent {
  textConfirmed: string;

  constructor(public dialogRef: MatDialogRef<ConfirmDialogComponent>,
              @Inject( MAT_DIALOG_DATA ) public data: ConfirmDialogData) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
