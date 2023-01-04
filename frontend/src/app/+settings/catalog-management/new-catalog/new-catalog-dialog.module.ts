import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatLegacyFormFieldModule as MatFormFieldModule } from "@angular/material/legacy-form-field";
import { FlexModule } from "@angular/flex-layout";
import { MatLegacySelectModule as MatSelectModule } from "@angular/material/legacy-select";
import { MatLegacyDialogModule as MatDialogModule } from "@angular/material/legacy-dialog";
import { MatLegacyInputModule as MatInputModule } from "@angular/material/legacy-input";
import { FormsModule } from "@angular/forms";
import { MatLegacyButtonModule as MatButtonModule } from "@angular/material/legacy-button";
import { MatLegacyCheckboxModule as MatCheckboxModule } from "@angular/material/legacy-checkbox";
import { MatLegacyRadioModule as MatRadioModule } from "@angular/material/legacy-radio";
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
    FlexModule,
    MatIconModule,
    FormFieldsModule,
    SharedPipesModule,
    DragDropModule,
  ],
})
export class NewCatalogDialogModule {}
