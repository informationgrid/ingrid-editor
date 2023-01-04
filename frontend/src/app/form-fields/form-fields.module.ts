import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DropDownComponent } from "./drop-down/drop-down.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DateboxComponent } from "./datebox/datebox.component";
import { CheckboxComponent } from "./checkbox/checkbox.component";
import { RadioboxComponent } from "./radiobox/radiobox.component";
import { MatLegacyButtonModule as MatButtonModule } from "@angular/material/legacy-button";
import { MatLegacyCheckboxModule as MatCheckboxModule } from "@angular/material/legacy-checkbox";
import { MatNativeDateModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatIconModule } from "@angular/material/icon";
import { MatLegacyInputModule as MatInputModule } from "@angular/material/legacy-input";
import { MatLegacyRadioModule as MatRadioModule } from "@angular/material/legacy-radio";
import { MatLegacySelectModule as MatSelectModule } from "@angular/material/legacy-select";
import { MatLegacyTableModule as MatTableModule } from "@angular/material/legacy-table";
import { FormLabelComponent } from "../formly/wrapper/form-label/form-label.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatRadioModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
  ],
  declarations: [
    DropDownComponent,
    DateboxComponent,
    CheckboxComponent,
    RadioboxComponent,
    FormLabelComponent,
  ],
  exports: [
    DropDownComponent,
    DateboxComponent,
    CheckboxComponent,
    RadioboxComponent,
    MatInputModule,
    FormLabelComponent,
  ],
})
export class FormFieldsModule {}
