import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NewDocumentComponent} from "./new-document/new-document.component";
import {DiscardConfirmDialogComponent} from "./discard-confirm/discard-confirm-dialog.component";
import {FormsModule} from "@angular/forms";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatDialogModule} from "@angular/material/dialog";
import {MatRadioModule} from "@angular/material/radio";
import {MatButtonModule} from '@angular/material/button';

@NgModule({
  declarations: [NewDocumentComponent, DiscardConfirmDialogComponent],
  imports: [
    CommonModule, FormsModule, MatCheckboxModule, MatRadioModule, MatDialogModule, MatButtonModule
  ],
  entryComponents: [NewDocumentComponent, DiscardConfirmDialogComponent]
})
export class FormDialogsModule {
}
