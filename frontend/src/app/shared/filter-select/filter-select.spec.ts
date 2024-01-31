/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
import { createComponentFactory, Spectator } from "@ngneat/spectator";

import { FilterSelectComponent } from "./filter-select.component";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatIconTestingModule } from "@angular/material/icon/testing";
import { createSignal } from "@angular/core/primitives/signals";
import { InputSignal } from "@angular/core";
import { SelectOptionUi } from "../../services/codelist/codelist.service";

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
    spectator.setInput(
      "options",
      createSignal([]) as InputSignal<SelectOptionUi[]>,
    );

    expect(spectator.component).toBeTruthy();
  });
});
