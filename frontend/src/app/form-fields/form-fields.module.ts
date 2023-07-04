import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DropDownComponent } from "./drop-down/drop-down.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DateboxComponent } from "./datebox/datebox.component";
import { CheckboxComponent } from "./checkbox/checkbox.component";
import { RadioboxComponent } from "./radiobox/radiobox.component";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatNativeDateModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatRadioModule } from "@angular/material/radio";
import { MatSelectModule } from "@angular/material/select";
import { MatTableModule } from "@angular/material/table";
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
    FormLabelComponent,
  ],
  declarations: [
    DropDownComponent,
    DateboxComponent,
    CheckboxComponent,
    RadioboxComponent,
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
