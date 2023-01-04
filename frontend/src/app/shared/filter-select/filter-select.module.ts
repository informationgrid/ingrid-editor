import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FilterSelectComponent } from "./filter-select.component";
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from "@angular/material/legacy-autocomplete";
import { MatLegacyFormFieldModule as MatFormFieldModule } from "@angular/material/legacy-form-field";
import { ReactiveFormsModule } from "@angular/forms";
import { MatLegacyInputModule as MatInputModule } from "@angular/material/legacy-input";
import { MatIconModule } from "@angular/material/icon";
import { MatLegacyButtonModule as MatButtonModule } from "@angular/material/legacy-button";

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
  declarations: [FilterSelectComponent],
  exports: [FilterSelectComponent],
})
export class FilterSelectModule {}
