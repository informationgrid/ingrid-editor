import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NewDocumentComponent} from '../../+form/dialogs/new-document/new-document.component';
import {DiscardConfirmDialogComponent} from '../../+form/dialogs/discard-confirm/discard-confirm-dialog.component';
import {FormsModule} from '@angular/forms';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDialogModule} from '@angular/material/dialog';
import {MatRadioModule} from '@angular/material/radio';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';

@NgModule({
  declarations: [NewDocumentComponent, DiscardConfirmDialogComponent],
  imports: [
    CommonModule, FormsModule, MatCheckboxModule, MatRadioModule, MatDialogModule, MatButtonModule, MatFormFieldModule
  ],
  entryComponents: [NewDocumentComponent, DiscardConfirmDialogComponent]
})
export class FormDialogsModule {
}
