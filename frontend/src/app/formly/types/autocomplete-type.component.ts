import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {FieldType} from '@ngx-formly/material';
import {MatInput} from '@angular/material/input';
import {MatAutocompleteTrigger} from '@angular/material/autocomplete';
import {Observable} from 'rxjs';
import {filter, map, startWith, take, tap} from 'rxjs/operators';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {SelectOption} from '../../services/codelist/codelist.service';

@UntilDestroy()
@Component({
  selector: 'ige-formly-autocomplete-type',
  templateUrl: './autocomplete-type.component.html'
})
export class AutocompleteTypeComponent extends FieldType implements OnInit, AfterViewInit {
  @ViewChild(MatInput, {static: true}) formFieldControl: MatInput;
  @ViewChild(MatAutocompleteTrigger, {static: true}) autocomplete: MatAutocompleteTrigger;

  private parameterOptions: SelectOption[] = [];
  filteredOptions: Observable<SelectOption[]>;

  ngOnInit() {
    super.ngOnInit();
    window.addEventListener('scroll', this.scrollEvent, true);

    if (this.to.options instanceof Observable) {
      this.to.options
        .pipe(
          untilDestroyed(this),
          filter(data => data !== undefined && data.length > 0),
          take(1),
          tap(data => this.initInputListener(data))
        )
        .subscribe();
    } else {
      this.initInputListener(this.to.options);
    }
  }

  private initInputListener(options: SelectOption[]) {
    this.parameterOptions = options;

    this.filteredOptions = this.formControl.valueChanges.pipe(
      untilDestroyed(this),
      startWith(''),
      map(value => this._filter(<string>value))
    );
  }

  _filter(value: string): SelectOption[] {
    if (value === undefined || value === null) return this.parameterOptions;
    const filterValue = value.toLowerCase();

    return this.parameterOptions
      ? this.parameterOptions.filter(option => option.label.toLowerCase().includes(filterValue))
      : [];
  }

  ngAfterViewInit() {
    super.ngAfterViewInit();
    // temporary fix for https://github.com/angular/material2/issues/6728
    // (<any>this.autocomplete)._formField = this.formField;
  }

  scrollEvent = (event: any): void => {
    if (this.autocomplete.panelOpen) {
      this.autocomplete.closePanel();
      //this.autocomplete.updatePosition();
    }
  };

}
