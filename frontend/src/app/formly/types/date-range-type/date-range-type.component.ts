import {Component, OnInit} from '@angular/core';
import {FieldType} from '@ngx-formly/material';
import {FormControl, FormGroup} from '@angular/forms';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'ige-date-range-type',
  templateUrl: './date-range-type.component.html',
  styleUrls: ['./date-range-type.component.scss']
})
export class DateRangeTypeComponent extends FieldType implements OnInit {

  rangeFormGroup = new FormGroup({
    start: new FormControl(null),
    end: new FormControl(null)
  });

  ngOnInit(): void {
    this.formControl.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(value => {
        this.rangeFormGroup.setValue(value ?? {
          start: null,
          end: null
        });
      });
  }

  updateFormControl() {
    this.formControl.setValue(this.rangeFormGroup.value);
  }
}
