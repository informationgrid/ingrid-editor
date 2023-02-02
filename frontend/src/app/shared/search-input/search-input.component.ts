import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Subscription } from "rxjs";
import { AbstractControl, FormControl } from "@angular/forms";
import { MatAutocomplete } from "@angular/material/autocomplete";

@Component({
  selector: "ige-search-input",
  templateUrl: "./search-input.component.html",
  styleUrls: ["./search-input.component.scss"],
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
