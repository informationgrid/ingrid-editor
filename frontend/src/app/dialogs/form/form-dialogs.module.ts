import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NewDocumentComponent} from "./new-document/new-document.component";
import {DiscardConfirmDialogComponent} from "./discard-confirm/discard-confirm-dialog.component";
import {FormsModule} from "@angular/forms";
import {MatCheckboxModule, MatDialogModule, MatRadioModule} from "@angular/material";

@NgModule({
  declarations: [NewDocumentComponent, DiscardConfirmDialogComponent],
  imports: [
    CommonModule, FormsModule, MatCheckboxModule, MatRadioModule, MatDialogModule
  ],
  entryComponents: [NewDocumentComponent, DiscardConfirmDialogComponent]
})
export class FormDialogsModule {
}
