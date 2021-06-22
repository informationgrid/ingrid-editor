import { Component, EventEmitter, Output } from "@angular/core";

@Component({
  selector: "ige-search-field",
  templateUrl: "./ige-search-field.component.html",
})
export class IgeSearchField {
  @Output() queryUpdate = new EventEmitter<string>();

  searchQuery: string;

  constructor() {
    this.searchQuery = "";
  }

  onSearchChange(searchValue: string) {
    this.searchQuery = searchValue;
    this.queryUpdate.emit(searchValue);
  }
}
