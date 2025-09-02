/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
import { Component, Input, input, output } from "@angular/core";
import { Subscription } from "rxjs";
import {
  AbstractControl,
  FormControl,
  FormGroupDirective,
  NgForm,
  ReactiveFormsModule,
} from "@angular/forms";
import {
  MatAutocomplete,
  MatAutocompleteModule,
} from "@angular/material/autocomplete";
import { MatInputModule } from "@angular/material/input";

import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";

import { ErrorStateMatcher } from "@angular/material/core";
import { FocusDirective } from "../../directives/focus.directive";

class MyErrorStateMatcher implements ErrorStateMatcher {
  constructor(private component: SearchInputComponent) {}

  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null,
  ): boolean {
    if (control?.invalid) return control.invalid && !this.component.hasFocus;
    else return false;
  }
}

@Component({
  selector: "ige-search-input",
  templateUrl: "./search-input.component.html",
  styleUrls: ["./search-input.component.scss"],
  imports: [
    MatInputModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    FocusDirective,
  ],
})
export class SearchInputComponent {
  readonly searchSub = input<Subscription>(undefined);

  readonly query = input<AbstractControl>(undefined);
  @Input() autocompleteRef: MatAutocomplete;
  readonly minWidth = input("100px");
  readonly flexWidth = input(false);
  readonly withButton = input(false);
  readonly rectangular = input(false);
  readonly placeholder = input("Suchbegriff eingeben");
  readonly showSearchIcon = input(false);
  @Input() hint: string;
  @Input() errorText: string;
  readonly withWhiteBorder = input(true);
  readonly focus = input(true);
  readonly ariaLabel = input<string>("Suche");
  readonly buttonClick = output<string>();
  hasFocus = false;
  matcher = new MyErrorStateMatcher(this);

  resetSearch() {
    this.query().reset("");
    this.searchSub()?.unsubscribe();
  }
}
