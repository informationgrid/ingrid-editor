import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Subscription } from "rxjs";
import { AbstractControl, ReactiveFormsModule } from "@angular/forms";
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
  @Input() withWhiteBorder = true;
  @Output() buttonClick = new EventEmitter<string>();

  resetSearch() {
    this.query.reset("");
    this.searchSub?.unsubscribe();
  }
}
