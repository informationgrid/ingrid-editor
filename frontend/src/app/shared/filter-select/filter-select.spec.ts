import { Spectator, createComponentFactory } from "@ngneat/spectator";

import { FilterSelectComponent } from "./filter-select.component";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { ReactiveFormsModule } from "@angular/forms";
import { of } from "rxjs";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";

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
    ],
  });

  it("should create", () => {
    spectator = createComponent();
    spectator.setInput("options", of([]));

    expect(spectator.component).toBeTruthy();
  });
});
