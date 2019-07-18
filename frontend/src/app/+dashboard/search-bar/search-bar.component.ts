import {Component, ElementRef, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {Observable} from "rxjs";
import {FormControl} from "@angular/forms";

// see: https://medium.com/@uditgogoi1/search-bar-with-autocomplete-using-angular-5-and-angular-material-c5a77a429da7
@Component({
  selector: 'ige-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent implements OnInit {

  myControl = new FormControl();
  filteredOptions: Observable<string[]>;
  autoCompleteList: any[];
  searchOption = [];

  @ViewChild('autocompleteInput', {static: true}) autocompleteInput: ElementRef;
  @Output() onSelectedOption = new EventEmitter();

  constructor() { }

  ngOnInit() {

    // get all the post

    // when user types something in input, the value changes will come through this
    this.myControl.valueChanges.subscribe(userInput => {
      this.autoCompleteExpenseList(userInput);
    })
  }

  private autoCompleteExpenseList(input) {
    let categoryList = this.filterCategoryList(input)
    this.autoCompleteList = categoryList;
  }

  // this is where filtering the data happens according to you typed value
  filterCategoryList(val) {
    var categoryList = [];
    if (typeof val != "string") {
      return [];
    }
    if (val === '' || val === null) {
      return [];
    }
  }

  // after you clicked an autosuggest option, this function will show the field you want to show in input
  displayFn(post) {
    let k = post ? post.title : post;
    return k;
  }

  filterPostList(event) {
  }

  removeOption(option) {

  }

  // focus the input field and remove any unwanted text.
  focusOnPlaceInput() {
    this.autocompleteInput.nativeElement.focus();
    this.autocompleteInput.nativeElement.value = '';
  }

}
