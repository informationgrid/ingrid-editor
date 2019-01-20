import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NewCatalogDialogComponent} from "./new-catalog/new-catalog-dialog.component";
import {UploadProfileDialogComponent} from "./upload-profile/upload-profile-dialog.component";
import {FormsModule} from "@angular/forms";
import {MatCheckboxModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatRadioModule} from "@angular/material";

@NgModule({
  declarations: [NewCatalogDialogComponent, UploadProfileDialogComponent],
  imports: [
    CommonModule, FormsModule,
    MatCheckboxModule, MatRadioModule, MatFormFieldModule, MatDialogModule, MatInputModule
  ],
  entryComponents: [NewCatalogDialogComponent, UploadProfileDialogComponent]
})
export class CatalogDialogsModule {
}
