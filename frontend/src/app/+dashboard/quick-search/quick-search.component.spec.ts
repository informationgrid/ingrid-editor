import {
  createComponentFactory,
  mockProvider,
  Spectator,
} from "@ngneat/spectator";

import { QuickSearchComponent } from "./quick-search.component";
import { DocumentService } from "../../services/document/document.service";
import { Router } from "@angular/router";
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from "@angular/material/legacy-autocomplete";
import { MatLegacyCardModule as MatCardModule } from "@angular/material/legacy-card";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatLegacyFormFieldModule as MatFormFieldModule } from "@angular/material/legacy-form-field";
import { MatLegacyInputModule as MatInputModule } from "@angular/material/legacy-input";
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
