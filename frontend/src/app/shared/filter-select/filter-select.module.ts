import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FilterSelectComponent } from "./filter-select.component";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatFormFieldModule } from "@angular/material/form-field";
import { ReactiveFormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";

@NgModule({
  imports: [
    CommonModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],
  declarations: [FilterSelectComponent, FilterSelectComponent],
  exports: [FilterSelectComponent, FilterSelectComponent],
})
export class FilterSelectModule {}
