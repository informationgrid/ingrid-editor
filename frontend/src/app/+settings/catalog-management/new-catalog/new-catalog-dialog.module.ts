import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatDialogModule } from "@angular/material/dialog";
import { MatInputModule } from "@angular/material/input";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatRadioModule } from "@angular/material/radio";
import { MatIconModule } from "@angular/material/icon";
import { NewCatalogDialogComponent } from "./new-catalog-dialog.component";
import { FormFieldsModule } from "../../../form-fields/form-fields.module";
import { SharedPipesModule } from "../../../directives/shared-pipes.module";
import { DragDropModule } from "@angular/cdk/drag-drop";

@NgModule({
  declarations: [NewCatalogDialogComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatCheckboxModule,
    MatRadioModule,
    MatFormFieldModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    FormFieldsModule,
    SharedPipesModule,
    DragDropModule,
  ],
})
export class NewCatalogDialogModule {}
