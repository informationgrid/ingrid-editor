import { Component, EventEmitter, Output, ViewChild } from "@angular/core";
import { MatInput } from "@angular/material/input";

@Component({
  selector: "ige-search-field",
  templateUrl: "./ige-search-field.component.html",
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
