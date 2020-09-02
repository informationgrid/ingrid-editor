import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FieldArrayType} from '@ngx-formly/core';
import {MatAutocompleteTrigger} from '@angular/material/autocomplete';
import {filter, map, startWith, take, tap} from 'rxjs/operators';
import {merge, Observable, Subject} from 'rxjs';
import {SelectOption} from '../../../services/codelist/codelist.service';
import {FormControl} from '@angular/forms';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'ige-repeat-list',
  templateUrl: './repeat-list.component.html',
  styleUrls: ['./repeat-list.component.scss']
})
export class RepeatListComponent extends FieldArrayType implements OnInit {

  @ViewChild('repeatListInput', {read: ElementRef}) autoCompleteEl: ElementRef;
  @ViewChild(MatAutocompleteTrigger) autoComplete: MatAutocompleteTrigger;

  filteredOptions: Observable<SelectOption[]>;
  parameterOptions: SelectOption[];
  inputControl = new FormControl();
  private manualUpdate = new Subject<string>();

  ngOnInit(): void {

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

    // show error immediately (on publish)
    this.inputControl.markAllAsTouched();

    this.filteredOptions =
      merge(
        this.inputControl.valueChanges,
        this.manualUpdate.asObservable()
      )
        .pipe(
          untilDestroyed(this),
          startWith(''),
          filter(value => value !== undefined && value !== null),
          map(value => this._filter(<string>value)),
          map(value => this._markSelected(value)),
          tap(console.log)
        );

  }

  addToList(value: any) {

    // ignore duplicate entries
    if (value === '' || this.model.indexOf(value) !== -1) {
      return;
    }

    this.add(null, value);

    this.inputControl.setValue('');

    if (!this.to.asSelect) {
      this.autoCompleteEl.nativeElement.blur();
      this.autoComplete.closePanel();
    } else {
      if (this._filter('').length === 0) {
        this.inputControl.disable();
      }
      setTimeout(() => this.inputControl.setValue(''));
    }

  }

  private _filter(value: string): SelectOption[] {
    const filterValue = value.toLowerCase();

    return this.parameterOptions?.filter(option => option.label.toLowerCase().includes(filterValue));
  }

  private _markSelected(value: SelectOption[]): SelectOption[] {
    return value
      ?.map(option => {
        if (this.model.indexOf(option.value) !== -1) {
          console.log(option)
          option.disabled = true;
        } else{
          option.disabled = false;
        }
        return option
      });
  }

  removeItem(index: number) {

    this.remove(index);
    this.manualUpdate.next('');

    if (this.to.asSelect && this.inputControl.disabled) {
      this.inputControl.enable();
    }

  }
}
