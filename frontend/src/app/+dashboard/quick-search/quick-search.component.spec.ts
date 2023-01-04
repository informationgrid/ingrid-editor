import {
  createComponentFactory,
  mockProvider,
  Spectator,
} from "@ngneat/spectator";

import { QuickSearchComponent } from "./quick-search.component";
import { DocumentService } from "../../services/document/document.service";
import { Router } from "@angular/router";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatCardModule } from "@angular/material/card";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatIconTestingModule } from "@angular/material/icon/testing";

describe("QuickSearchComponent", () => {
  let spectator: Spectator<QuickSearchComponent>;
  const createComponent = createComponentFactory({
    component: QuickSearchComponent,
    imports: [
      MatAutocompleteModule,
      MatCardModule,
      FormsModule,
      ReactiveFormsModule,
      MatFormFieldModule,
      MatInputModule,
      MatIconTestingModule,
    ],
    mocks: [DocumentService, Router],
  });

  it("should create", () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
