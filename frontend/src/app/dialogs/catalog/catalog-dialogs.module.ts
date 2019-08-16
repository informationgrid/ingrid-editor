import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NewCatalogDialogComponent} from "./new-catalog/new-catalog-dialog.component";
import {UploadProfileDialogComponent} from "./upload-profile/upload-profile-dialog.component";
import {FormsModule} from "@angular/forms";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatDialogModule} from "@angular/material/dialog";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatRadioModule} from "@angular/material/radio";
import {MatButtonModule} from '@angular/material/button';

@NgModule({
  declarations: [NewCatalogDialogComponent, UploadProfileDialogComponent],
  imports: [
    CommonModule, FormsModule,
    MatCheckboxModule, MatRadioModule, MatFormFieldModule, MatDialogModule, MatInputModule, MatButtonModule
  ],
  entryComponents: [NewCatalogDialogComponent, UploadProfileDialogComponent]
})
export class CatalogDialogsModule {
}
