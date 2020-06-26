import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FieldArrayType} from '@ngx-formly/core';
import {MatAutocompleteTrigger} from '@angular/material/autocomplete';
import {filter, map, startWith, take, tap} from 'rxjs/operators';
import {Observable} from 'rxjs';
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

    this.filteredOptions = this.inputControl.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value))
      );

  }

  addToList(value: any) {

    // ignore duplicate entries
    if (this.model.indexOf(value) !== -1) {
      return;
    }

    this.add(null, value);

    this.inputControl.setValue('');

    if (!this.to.asSelect) {
      this.autoCompleteEl.nativeElement.blur();
      this.autoComplete.closePanel();
    }

  }

  private _filter(value: string): SelectOption[] {
    const filterValue = value.toLowerCase();

    return this.parameterOptions
      ?.filter(option => this.model.indexOf(option.value) === -1)
      ?.filter(option => option.label.toLowerCase().includes(filterValue));
  }

}
