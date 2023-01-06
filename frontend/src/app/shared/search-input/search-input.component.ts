import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Subscription } from "rxjs";
import { FormControl } from "@angular/forms";
import { MatAutocomplete } from "@angular/material/autocomplete";

@Component({
  selector: "ige-search-input",
  templateUrl: "./search-input.component.html",
  styleUrls: ["./search-input.component.scss"],
})
export class SearchInputComponent {
  @Input() searchSub: Subscription;

  @Input() query: FormControl;
  @Input() autocompleteRef: MatAutocomplete;
  @Input() minWidth = "100%";
  @Input() withButton = false;
  @Input() placeholder = "Suchbegriff eingeben";
  @Input() showSearchIcon = false;
  @Output() buttonClick = new EventEmitter<string>();

  resetSearch() {
    this.query.reset("");
    this.searchSub?.unsubscribe();
  }
}
