import { Component, EventEmitter, Input, Output } from "@angular/core";
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
import { NgIf } from "@angular/common";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { SharedPipesModule } from "../../directives/shared-pipes.module";
import { ErrorStateMatcher } from "@angular/material/core";

class MyErrorStateMatcher implements ErrorStateMatcher {
  constructor(private component: SearchInputComponent) {}

  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
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
    NgIf,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    SharedPipesModule,
  ],
  standalone: true,
})
export class SearchInputComponent {
  @Input() searchSub: Subscription;

  @Input() query: AbstractControl;
  @Input() autocompleteRef: MatAutocomplete;
  @Input() minWidth = "100px";
  @Input() flexWidth = false;
  @Input() withButton = false;
  @Input() rectangular = false;
  @Input() placeholder = "Suchbegriff eingeben";
  @Input() showSearchIcon = false;
  @Input() hint: string;
  @Input() errorText: string;
  @Input() withWhiteBorder = true;
  @Input() focus = true;
  @Input() ariaLabel: string = "Suche";
  @Output() buttonClick = new EventEmitter<string>();
  hasFocus = false;
  matcher = new MyErrorStateMatcher(this);

  resetSearch() {
    this.query.reset("");
    this.searchSub?.unsubscribe();
  }
}
