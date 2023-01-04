import { Spectator, createComponentFactory } from "@ngneat/spectator";

import { FilterSelectComponent } from "./filter-select.component";
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from "@angular/material/legacy-autocomplete";
import { ReactiveFormsModule } from "@angular/forms";
import { of } from "rxjs";
import { MatLegacyFormFieldModule as MatFormFieldModule } from "@angular/material/legacy-form-field";
import { MatLegacyInputModule as MatInputModule } from "@angular/material/legacy-input";
import { MatIconModule } from "@angular/material/icon";
import { MatLegacyButtonModule as MatButtonModule } from "@angular/material/legacy-button";
import { MatIconTestingModule } from "@angular/material/icon/testing";

describe("FilterSelectComponent", () => {
  let spectator: Spectator<FilterSelectComponent>;
  const createComponent = createComponentFactory({
    component: FilterSelectComponent,
    imports: [
      MatAutocompleteModule,
      MatFormFieldModule,
      ReactiveFormsModule,
      MatInputModule,
      MatIconModule,
      MatButtonModule,
      MatIconTestingModule,
    ],
    detectChanges: false,
  });

  it("should create", () => {
    spectator = createComponent();
    spectator.setInput("options", of([]));

    expect(spectator.component).toBeTruthy();
  });
});
