import { Component, EventEmitter, Output, ViewChild } from "@angular/core";
import { MatLegacyInput as MatInput } from "@angular/material/legacy-input";

@Component({
  selector: "ige-search-field",
  templateUrl: "./ige-search-field.component.html",
  styleUrls: ["./ige-search-field.component.scss"],
})
export class IgeSearchField {
  @Output() queryUpdate = new EventEmitter<string>();

  @ViewChild(MatInput) searchField: MatInput;

  searchQuery: string;

  constructor() {
    this.searchQuery = "";
  }

  onSearchChange(searchValue: string) {
    this.searchQuery = searchValue;
    this.queryUpdate.emit(searchValue);
  }
}
