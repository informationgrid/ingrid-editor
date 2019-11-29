import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DiscardConfirmDialogComponent} from '../../+form/dialogs/discard-confirm/discard-confirm-dialog.component';
import {FormsModule} from '@angular/forms';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDialogModule} from '@angular/material/dialog';
import {MatRadioModule} from '@angular/material/radio';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';

@NgModule({
  declarations: [DiscardConfirmDialogComponent],
  imports: [
    CommonModule, FormsModule, MatCheckboxModule, MatRadioModule, MatDialogModule, MatButtonModule, MatFormFieldModule
  ],
  entryComponents: [DiscardConfirmDialogComponent]
})
export class FormDialogsModule {
}
