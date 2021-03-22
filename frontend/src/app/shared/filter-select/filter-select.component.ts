import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl} from '@angular/forms';
import {combineLatest, Observable} from 'rxjs';
import {filter, map, startWith, tap} from 'rxjs/operators';
import {SelectOption} from '../../services/codelist/codelist.service';

@Component({
  selector: 'ige-filter-select',
  templateUrl: './filter-select.component.html',
  styleUrls: ['./filter-select.component.scss']
})
export class FilterSelectComponent implements OnInit {

  @Input() options: Observable<SelectOption[]>;
  @Input() labelFormat: (value: SelectOption) => string = (value) => value.label;
  @Input() placeholder: string;

  @Output() optionSelect = new EventEmitter<SelectOption>();
  @Output() reset = new EventEmitter<string>();

  control = new FormControl();

  filteredOptions: Observable<SelectOption[]>;

  constructor() {
  }

  ngOnInit(): void {
    this.filteredOptions = combineLatest([
      this.control.valueChanges.pipe(startWith('')),
      this.options
    ]).pipe(
      tap(value => console.log(value)),
      // only filter input strings and selections
      filter(value => !(value[0] instanceof Object)),
      map(value => this._filter(value[0], value[1]))
    );
  }

  private _filter(value: string, allCodelists: SelectOption[]): SelectOption[] {
    const filterValue = value.toLowerCase();

    return allCodelists
      .filter(option => this.labelFormat(option).toLowerCase().includes(filterValue));
  }

  resetInput() {
    this.control.reset('');
    this.reset.emit();
  }

  updateSelection(value: SelectOption) {
    this.control.setValue(this.labelFormat(value));
    // TODO: blur control html element for easier selection?
    this.optionSelect.emit(value);
  }
}
